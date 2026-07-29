import { X, Shield, Upload, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadModal({
  showUploadModal,
  setShowUploadModal,
  loggedInUser,
  uploadType,
  setUploadType,
  uploadTitle,
  setUploadTitle,
  uploadDesc,
  setUploadDesc,
  uploadProf,
  setUploadProf,
  uploadProfName,
  uploadImage,
  setUploadImage,
  uploadPdf,
  setUploadPdf,
  uploadExternalUrl,
  setUploadExternalUrl,
  uploadStatus,
  uploadMsg,
  handleUploadSubmit
}) {
  if (!showUploadModal || loggedInUser?.role !== 'Admin') return null;

  return (
    <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
      <div className="modal-content glass-panel" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowUploadModal(false)}>
          <X size={20} />
        </button>
        
        <div className="modal-header">
          <Shield size={32} className="modal-icon text-teal" />
          <h3>Đăng Tải Tài Liệu Mới</h3>
          <p>Hệ thống tự động phát hành Real-time lên trang chủ và thư viện</p>
        </div>

        <form className="modal-form" onSubmit={handleUploadSubmit}>
          <div className="form-group">
            <label htmlFor="up-type">Phân loại học liệu</label>
            <select 
              id="up-type" 
              className="form-input select-input"
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
            >
              <option value="documentsData">Ấn phẩm & Tài liệu ôn tập</option>
              <option value="midtermExams">Đề thi giữa kỳ của giảng viên</option>
              <option value="finalExams">Đề thi cuối kỳ chính thức</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="up-title">Tiêu đề tài liệu</label>
            <input 
              type="text" 
              id="up-title" 
              className="form-input" 
              placeholder="e.g. Tuyển tập 50 câu trắc nghiệm giới hạn" 
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="up-desc">Mô tả tóm tắt nội dung</label>
            <textarea 
              id="up-desc" 
              className="form-input text-area" 
              rows="3" 
              placeholder="e.g. Tài liệu gồm các câu trắc nghiệm giới hạn chọn lọc kèm lời giải thích chương 4..." 
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Conditional Prof Options for Midterms */}
          {uploadType === 'midtermExams' && (
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="up-prof">Mã giảng viên</label>
                <select 
                  id="up-prof" 
                  className="form-input select-input"
                  value={uploadProf}
                  onChange={(e) => setUploadProf(e.target.value)}
                >
                  <option value="pnta">pnta (Thầy Phan Ngô Tuấn Anh)</option>
                  <option value="ndt">ndt (Thầy Nguyễn Đình Tuấn)</option>
                  <option value="ntv">ntv (Thầy Ngô Trấn Vũ)</option>
                  <option value="ntvv">ntvv (Thầy Nguyễn Thanh Vân)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tên giảng viên</label>
                <input type="text" className="form-input" value={uploadProfName} disabled />
              </div>
            </div>
          )}

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="up-image">Tên tệp hình ảnh bìa (Thư mục images)</label>
              <input 
                type="text" 
                id="up-image" 
                className="form-input" 
                placeholder="e.g. tccvang.jpg" 
                value={uploadImage}
                onChange={(e) => setUploadImage(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="up-pdf">Tên tệp PDF tài liệu (Thư mục docs)</label>
              <input 
                type="text" 
                id="up-pdf" 
                className="form-input" 
                placeholder="e.g. tccvang.pdf" 
                value={uploadPdf}
                onChange={(e) => setUploadPdf(e.target.value)}
              />
            </div>
          </div>

          {uploadType === 'documentsData' && (
            <div className="form-group">
              <label htmlFor="up-ext">Đường dẫn Google Drive (Không bắt buộc)</label>
              <input 
                type="text" 
                id="up-ext" 
                className="form-input" 
                placeholder="e.g. https://drive.google.com/file/d/..." 
                value={uploadExternalUrl}
                onChange={(e) => setUploadExternalUrl(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full mt-2" disabled={uploadStatus === 'loading'}>
            <Upload size={16} />
            <span>Đăng Tải Lên Hệ Thống</span>
          </button>

          {uploadStatus === 'loading' && <div className="status-msg loading mt-3">Đang lưu trữ dữ liệu...</div>}
          
          {uploadStatus === 'success' && (
            <div className="status-msg success mt-3">
              <CheckCircle size={15} />
              <span>{uploadMsg}</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="status-msg error mt-3">
              <AlertCircle size={15} />
              <span>{uploadMsg}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
