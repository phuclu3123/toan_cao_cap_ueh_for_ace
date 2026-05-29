import { CheckCircle2, Copy, KeyRound, Link as LinkIcon, Server, ShieldCheck, Webhook } from 'lucide-react';
import { API_BASE_URL } from '../config';
import '../assets/styles/Home.css';

const webhookPath = '/api/payos/webhook';
const statusPath = '/api/payments/:orderCode';
const confirmPath = '/api/payos/confirm-webhook';

export default function PayOSApiPage() {
  const webhookUrl = `${API_BASE_URL}${webhookPath}`;
  const statusUrl = `${API_BASE_URL}/api/payments/10001`;

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className="home-page page-shell api-doc-page">
      <section className="page-hero api-doc-hero">
        <div className="container page-hero-grid">
          <div>
            <span className="hero-badge"><Webhook size={14} /> Dọc API</span>
            <h1>PayOS Webhook</h1>
            <p>
              Khu vực này chỉ dành cho phần backend nhận thanh toán PayOS. WinForms không nhận webhook trực tiếp;
              PayOS sẽ gọi về endpoint public HTTPS của backend, sau đó backend lưu trạng thái thanh toán.
            </p>
          </div>
          <div className="api-endpoint-panel glass-panel">
            <span className="api-panel-label">Webhook URL</span>
            <code>{webhookUrl}</code>
            <button type="button" className="btn btn-primary" onClick={() => copyText(webhookUrl)}>
              <Copy size={16} />
              <span>Sao chép</span>
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container api-doc-grid">
          <article className="api-doc-card">
            <div className="api-doc-icon"><Server size={22} /></div>
            <h2>Endpoint đã tạo</h2>
            <div className="api-row">
              <span>POST</span>
              <code>{webhookPath}</code>
            </div>
            <p>PayOS gọi endpoint này khi có giao dịch. Backend xác thực signature bằng checksum key rồi cập nhật payment thành PAID.</p>
          </article>

          <article className="api-doc-card">
            <div className="api-doc-icon"><LinkIcon size={22} /></div>
            <h2>Kiểm tra trạng thái</h2>
            <div className="api-row">
              <span>GET</span>
              <code>{statusPath}</code>
            </div>
            <p>Client sau này có thể gọi endpoint này để đọc trạng thái theo orderCode.</p>
            <button type="button" className="api-copy-btn" onClick={() => copyText(statusUrl)}>
              <Copy size={15} />
              <span>Sao chép URL mẫu</span>
            </button>
          </article>

          <article className="api-doc-card">
            <div className="api-doc-icon"><ShieldCheck size={22} /></div>
            <h2>Xác thực bảo mật</h2>
            <div className="api-check-list">
              <span><CheckCircle2 size={15} /> API key chỉ nằm ở backend</span>
              <span><CheckCircle2 size={15} /> Checksum key không đưa lên trình duyệt</span>
              <span><CheckCircle2 size={15} /> Webhook sai signature sẽ bị từ chối</span>
            </div>
          </article>
        </div>
      </section>

      <section className="section api-flow-section">
        <div className="container">
          <div className="section-title section-title-split">
            <div>
              <span className="section-subtitle">Kết nối payOS</span>
              <h2>Đăng ký webhook khi đã có domain public HTTPS.</h2>
            </div>
            <p>
              Khi test local, dùng ngrok trỏ về port backend rồi lấy URL HTTPS ghép với <code>{webhookPath}</code>.
            </p>
          </div>

          <div className="api-command-panel">
            <div className="api-command-title">
              <KeyRound size={18} />
              <span>Gọi từ Postman hoặc công cụ nội bộ</span>
            </div>
            <pre>{`POST ${API_BASE_URL}${confirmPath}
Headers:
  Content-Type: application/json
  x-payos-confirm-token: <PAYOS_CONFIRM_TOKEN>

Body:
{
  "webhookUrl": "https://your-domain.com${webhookPath}"
}`}</pre>
          </div>
        </div>
      </section>
    </div>
  );
}
