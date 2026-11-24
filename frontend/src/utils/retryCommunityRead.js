/** Retry only explicitly read-only community requests after transient outages. */
export async function retryCommunityRead(read, {
  delays = [400, 1000],
  wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
} = {}) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await read();
    } catch (error) {
      const transient = [502, 503, 504].includes(error.status)
        || (error instanceof TypeError && !error.status);
      if (!transient || attempt >= delays.length) throw error;
      await wait(delays[attempt]);
    }
  }
}
