let readyPromise;

export function loadYouTubePlayerAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (readyPromise) return readyPromise;
  readyPromise = new Promise((resolve, reject) => {
    let settled = false;
    let script = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    const finish = (error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      script?.removeEventListener('error', handleError);
      if (error) { readyPromise = undefined; script?.remove(); reject(error); }
      else resolve(window.YT);
    };
    const handleError = () => finish(new Error('Không tải được YouTube. Kiểm tra kết nối rồi thử lại.'));
    const timeout = window.setTimeout(() => finish(new Error('YouTube phản hồi quá lâu. Bạn có thể thử tải lại video.')), 15000);
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try { previous?.(); } finally { finish(); }
    };
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener('error', handleError, { once: true });
  });
  return readyPromise;
}

export function describeYouTubeError(code) {
  if (code === 100) return 'Video này không còn tồn tại hoặc đã được đặt riêng tư.';
  if (code === 101 || code === 150) return 'Chủ video không cho phép nhúng. Bạn có thể mở bài này trên YouTube.';
  if (code === 153) return 'YouTube chưa nhận được thông tin trang nhúng. Thử tải lại hoặc mở video trên YouTube.';
  if (code === 2) return 'Địa chỉ video chưa hợp lệ.';
  return 'Chưa phát được video. Hãy thử lại hoặc mở trên YouTube.';
}
