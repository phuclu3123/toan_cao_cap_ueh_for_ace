// BroomSharing reserves this range; WEB_TCC's timestamp-based course orders keep their existing flow.
export const isBroomSharingOrder = (order) => Number.isSafeInteger(order)
  && order >= 10_000_000_000_000 && order < 90_000_000_000_000;

export const validateRelayDestination = (value) => {
  const url = new URL(value);
  if (url.protocol !== 'https:' || !/^[a-z0-9-]+\.trycloudflare\.com$/.test(url.hostname)
      || url.username || url.password || url.port || url.search || url.hash
      || url.pathname !== '/api/payos/webhook') {
    throw new Error('A BroomSharing HTTPS demo webhook is required.');
  }
  return url.toString();
};

// Called only AFTER the existing payOS checksum check. Forward the original signed body unchanged.
export const forwardBroomSharingWebhook = async (body, { hasCourseOrder, readRelay, send = fetch }) => {
  if (!isBroomSharingOrder(Number(body?.data?.orderCode))) return false;
  if (await hasCourseOrder(Number(body.data.orderCode))) return false;
  const config = await readRelay();
  if (!config?.destination) return false;
  const target = validateRelayDestination(config.destination);
  let response;
  try {
    response = await send(target, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), redirect: 'error', signal: AbortSignal.timeout(15_000)
    });
    if (!response.ok) throw new Error('Destination did not acknowledge the webhook.');
    await response.body?.cancel();
  } catch {
    const error = new Error('BroomSharing webhook destination is unavailable; retry required.');
    error.statusCode = 503;
    error.code = 'BROOMSHARING_RELAY_UNAVAILABLE';
    throw error;
  }
  return true;
};
