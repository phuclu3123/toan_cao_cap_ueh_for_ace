import crypto from 'node:crypto';

// Keep published versions available: old orders retain the text they accepted.
const document = {
  version: '2026-11-18.1',
  effectiveDate: '2026-11-18',
  title: 'Điều khoản mua và sử dụng khóa học UEH TCC',
  seller: { name: 'Lữ Võ Hoàng Phúc', role: 'Quản trị Toán Cao Cấp', email: 'luphuc321@gmail.com' },
  confirmation: 'XÁC NHẬN MUA',
  sections: [
    { title: '1. Kiểm tra trước khi mua', text: 'Người mua có trách nhiệm đọc mô tả, lộ trình, bài học xem thử, học phí và điều kiện sử dụng; kiểm tra đúng khóa học và email nhận quyền. Chỉ tiếp tục thanh toán khi đã hiểu nội dung và tự nguyện đăng ký. Nếu còn thắc mắc, hãy liên hệ bộ phận hỗ trợ của website trước khi thanh toán.' },
    { title: '2. Cấp và sử dụng quyền học', text: 'Quyền học được gắn với tài khoản đã đăng nhập sau khi hệ thống xác minh thanh toán thành công. Người mua tự bảo quản tài khoản, chuẩn bị thiết bị và kết nối Internet phù hợp; không bán lại, chia sẻ tài khoản hoặc phát tán học liệu trái phép. Quyền học không đồng nghĩa với cam kết điểm thi hay kết quả học tập cụ thể.' },
    { title: '3. Chính sách không hoàn tiền do thay đổi nhu cầu', text: 'Sau khi thanh toán thành công và quyền truy cập được cung cấp đúng nội dung đã công bố, UEH TCC không áp dụng hoàn tiền theo yêu cầu đổi ý, không sắp xếp được thời gian học, chưa sử dụng hoặc không còn nhu cầu. Người mua tự chịu trách nhiệm đối với quyết định đăng ký tự nguyện của mình trong phạm vi pháp luật cho phép.' },
    { title: '4. Trường hợp cần xử lý và quyền được pháp luật bảo vệ', text: 'Chính sách trên không loại trừ trách nhiệm của bên cung cấp hoặc quyền hợp pháp của người tiêu dùng. Thanh toán trùng, thu sai tiền, không cung cấp được quyền học, nội dung cung cấp không đúng cam kết và các trường hợp phải hoàn trả theo pháp luật được tiếp nhận, đối soát và giải quyết riêng. Không yêu cầu người mua từ bỏ quyền phản ánh, khiếu nại hoặc khởi kiện.' },
    { title: '5. Hỗ trợ và đối soát', text: 'Đầu mối vận hành và hỗ trợ: Lữ Võ Hoàng Phúc, quản trị Toán Cao Cấp, email luphuc321@gmail.com. Khi cần hỗ trợ, người mua cung cấp email tài khoản, mã đơn và thông tin giao dịch cần thiết; không cung cấp mật khẩu, OTP hoặc dữ liệu ngân hàng nhạy cảm. Việc tiếp nhận yêu cầu không đồng nghĩa với giao dịch đã được hoàn tiền. Kết quả xử lý dựa trên giao dịch thực tế, thỏa thuận và quy định pháp luật.' },
    { title: '6. Xác nhận giao dịch và lưu điều khoản', text: 'Trước khi tạo đơn, người mua cần chủ động đánh dấu đồng ý và nhập cụm từ xác nhận. Hệ thống lưu phiên bản điều khoản, thời điểm xác nhận, tài khoản nhận quyền, khóa học và giá đã xác nhận cùng đơn hàng. Người mua có thể xem và tải bản xác nhận từ đơn hàng. Thay đổi chính sách sau này không tự động thay thế nội dung đã lưu trên đơn cũ.' }
  ]
};
export const PURCHASE_TERMS = Object.freeze({ ...document, hash: crypto.createHash('sha256').update(JSON.stringify(document)).digest('hex') });
export const normalizeConfirmation = (value) => typeof value === 'string' ? value.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleUpperCase('vi-VN') : '';
export function validatePurchaseConsent(value, user, amount) {
  const fail = (code, message) => { throw Object.assign(new Error(message), { statusCode: 422, code }); };
  if (!value || value.accepted !== true) fail('PURCHASE_CONSENT_REQUIRED', 'Vui lòng đọc và đồng ý điều khoản mua khóa học.');
  if (value.version !== PURCHASE_TERMS.version) fail('PURCHASE_TERMS_CHANGED', 'Điều khoản đã được cập nhật. Vui lòng đọc và xác nhận lại.');
  if (normalizeConfirmation(value.confirmation) !== PURCHASE_TERMS.confirmation) fail('PURCHASE_CONFIRMATION_REQUIRED', `Vui lòng nhập ${PURCHASE_TERMS.confirmation} để xác nhận quyết định mua.`);
  if (value.amount !== amount) fail('CHECKOUT_PRICE_CHANGED', 'Tổng thanh toán đã thay đổi. Vui lòng kiểm tra giá và xác nhận lại.');
  return { version: PURCHASE_TERMS.version, documentHash: PURCHASE_TERMS.hash, acceptedAt: new Date(), acceptedBy: user.id, confirmation: PURCHASE_TERMS.confirmation, amount, document: PURCHASE_TERMS };
}
