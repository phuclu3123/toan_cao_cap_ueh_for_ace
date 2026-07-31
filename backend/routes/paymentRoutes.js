import express from 'express';
import { 
  createPayment, 
  handleWebhook, 
  confirmWebhook, 
  getPaymentStatus 
} from '../controllers/paymentController.js';
import Payment from '../models/Payment.js';

const router = express.Router();

router.get('/api/payos/webhook', (req, res) => {
  res.json({
    success: true,
    message: 'payOS webhook endpoint is ready. payOS will call this URL with POST.',
    method: 'POST',
    path: '/api/payos/webhook'
  });
});

router.post('/api/payos/create-payment', createPayment);
router.post('/api/payos/webhook', handleWebhook);
router.post('/api/payos/confirm-webhook', confirmWebhook);
router.get(['/api/payments/:orderCode', '/api/payos/payments/:orderCode'], getPaymentStatus);

// Redirect endpoints
router.get('/payment/success', async (req, res) => {
  const orderCode = Number(req.query.orderCode);
  if (Number.isFinite(orderCode)) {
    try {
      await Payment.updateOne({ orderCode }, { $set: { status: 'PAID' } });
      console.log(`Cập nhật trạng thái PAID cho đơn hàng ${orderCode} qua link redirect`);
    } catch (err) {
      console.error('Lỗi cập nhật status khi redirect success:', err);
    }
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <title>Thanh toán thành công</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary: #0d9488;
            --primary-glow: rgba(13, 148, 136, 0.3);
            --bg-grad: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            --text: #f8fafc;
            --text-muted: #94a3b8;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Be Vietnam Pro', sans-serif;
            background: var(--bg-grad);
            color: var(--text);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
            overflow: hidden;
          }
          .container {
            position: relative;
            width: 100%;
            max-width: 460px;
            perspective: 1000px;
          }
          .card {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 40px 30px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 
                        0 0 50px var(--primary-glow);
            transform: translateY(30px);
            opacity: 0;
            animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes slideUp {
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .icon-wrapper {
            width: 80px;
            height: 80px;
            background: rgba(16, 185, 129, 0.15);
            border: 2px solid #10b981;
            border-radius: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 25px;
            font-size: 40px;
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
          h1 {
            font-size: 26px;
            font-weight: 800;
            margin-bottom: 12px;
            background: linear-gradient(to right, #34d399, #059669);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          p {
            color: var(--text-muted);
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 35px;
          }
          .btn-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .btn {
            display: block;
            width: 100%;
            padding: 14px 20px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            text-decoration: none;
            outline: none;
          }
          .btn-primary {
            background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
            color: white;
            border: none;
            box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(13, 148, 136, 0.5);
            background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
          }
          .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            color: #e2e8f0;
            border: 1px solid rgba(255, 255, 255, 0.15);
          }
          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.3);
            color: white;
            transform: translateY(-2px);
          }
        </style>
        <script>
          function handleClose() {
            window.open('', '_self', '');
            window.close();
            setTimeout(function() {
              window.location.href = 'https://toancaocapueh.netlify.app';
            }, 500);
          }
        </script>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="icon-wrapper">✓</div>
            <h1>Thanh Toán Thành Công!</h1>
            <p>Giao dịch của bạn đã hoàn tất. Cửa sổ này sẽ tự động đóng, hoặc bạn có thể quay lại trang học tập ngay bây giờ.</p>
            <div class="btn-group">
              <button class="btn btn-primary" onclick="handleClose()">Đóng Cửa Sổ</button>
              <a href="https://toancaocapueh.netlify.app" class="btn btn-secondary">Về Trang Học Tập</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
});

router.get('/payment/cancel', async (req, res) => {
  const orderCode = Number(req.query.orderCode);
  if (Number.isFinite(orderCode)) {
    try {
      await Payment.updateOne({ orderCode }, { $set: { status: 'CANCELLED' } });
      console.log(`Cập nhật trạng thái CANCELLED cho đơn hàng ${orderCode} qua link redirect`);
    } catch (err) {
      console.error('Lỗi cập nhật status khi redirect cancel:', err);
    }
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <title>Hủy thanh toán</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary: #ef4444;
            --primary-glow: rgba(239, 68, 68, 0.25);
            --bg-grad: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            --text: #f8fafc;
            --text-muted: #94a3b8;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Be Vietnam Pro', sans-serif;
            background: var(--bg-grad);
            color: var(--text);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
            overflow: hidden;
          }
          .container {
            position: relative;
            width: 100%;
            max-width: 460px;
            perspective: 1000px;
          }
          .card {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 40px 30px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 
                        0 0 50px var(--primary-glow);
            transform: translateY(30px);
            opacity: 0;
            animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes slideUp {
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .icon-wrapper {
            width: 80px;
            height: 80px;
            background: rgba(239, 68, 68, 0.15);
            border: 2px solid #ef4444;
            border-radius: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 25px;
            font-size: 40px;
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
          h1 {
            font-size: 26px;
            font-weight: 800;
            margin-bottom: 12px;
            background: linear-gradient(to right, #f87171, #ef4444);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          p {
            color: var(--text-muted);
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 35px;
          }
          .btn-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .btn {
            display: block;
            width: 100%;
            padding: 14px 20px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            text-decoration: none;
            outline: none;
          }
          .btn-primary {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border: none;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          }
          .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            color: #e2e8f0;
            border: 1px solid rgba(255, 255, 255, 0.15);
          }
          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.3);
            color: white;
            transform: translateY(-2px);
          }
        </style>
        <script>
          function handleClose() {
            window.open('', '_self', '');
            window.close();
            setTimeout(function() {
              window.location.href = 'https://toancaocapueh.netlify.app';
            }, 500);
          }
        </script>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="icon-wrapper">✕</div>
            <h1>Giao Dịch Đã Hủy</h1>
            <p>Yêu cầu thanh toán này đã bị hủy. Cửa sổ này sẽ tự động đóng, hoặc bạn có thể quay lại trang học tập ngay bây giờ.</p>
            <div class="btn-group">
              <button class="btn btn-primary" onclick="handleClose()">Đóng Cửa Sổ</button>
              <a href="https://toancaocapueh.netlify.app" class="btn btn-secondary">Về Trang Học Tập</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
});

export default router;
