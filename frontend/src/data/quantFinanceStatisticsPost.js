const math = String.raw;
const code = String.raw;

export const quantFinanceStatisticsPost = {
  slug: 'thong-ke-den-quant-finance-vn30',
  title: 'Từ thống kê mẫu đến Quant Finance: đo lợi suất và rủi ro trên VN30',
  category: 'Chuyên khảo · Quant Finance',
  date: '23/07/2026',
  updatedAt: 'Đã đối chiếu nguồn ngày 23/07/2026',
  author: 'Lữ Võ Hoàng Phúc (K50 UEH)',
  readingTime: '48 phút đọc · kèm công thức, ma trận và Python',
  level: 'Nền tảng thống kê → stochastic control nâng cao',
  keywords: [
    'VN30',
    'Log-return',
    'Sample variance',
    'Volatility',
    'Common noise',
    'Idiosyncratic risk',
    'Factor model',
    'LQ control',
  ],
  image: '/images/quant-finance-cover.svg',
  excerpt:
    'Một bản đồ ký hiệu có hệ thống từ mean, sample variance và covariance đến log-return, volatility, hình học ma trận, Cholesky, phân phối Gaussian, Brownian motion, common noise và idiosyncratic diffusion. Mỗi khái niệm được trình bày theo ba lớp: thống kê, tài chính và Python.',
  scope: {
    label: 'Mục tiêu của bài',
    title: 'Không học thuộc công thức tài chính tách rời thống kê',
    description:
      'Bài viết xuất phát từ mẫu quan sát, giữ nguyên mẫu số và đơn vị đo, rồi mới chuyển từng đại lượng sang ngôn ngữ lợi suất và rủi ro của VN30.',
  },
  highlights: [
    { value: '03', label: 'tầng đọc: thống kê · tài chính · code' },
    { value: '16', label: 'section từ nền tảng đến nâng cao' },
    { value: '01', label: 'pipeline có thể tái lập' },
  ],
  toc: [
    'Dẫn nhập: s² có phải var không?',
    '1. Bản đồ ký hiệu: tổng thể, mẫu và ước lượng',
    '2. Từ giá hiệu chỉnh đến log-return',
    '3. Mean của return và drift của mô hình giá',
    '4. Variance, standard deviation và volatility',
    '5. Covariance, correlation và ma trận rủi ro',
    '6. Ma trận xác định dương, bán xác định dương và trị riêng',
    '7. Phân rã Cholesky và sinh nhiễu tương quan',
    '8. Sigma ID và Sigma 0 trong đúng mô hình của đề tài',
    '9. Ký hiệu phân phối, dấu ~ và Gaussian đa biến',
    '10. Brownian motion, kỳ vọng có điều kiện và empirical law',
    '11. Từ VN30 đến common và idiosyncratic volatility',
    '12. Hai cách hiệu chỉnh sigma₀ và sigmaID từ return',
    '13. Từ rủi ro thống kê đến hàm mục tiêu LQ',
    '14. Pipeline Python có thể tái lập',
    '15. Chẩn đoán mô hình và các bẫy thực nghiệm',
    '16. Tài liệu tham khảo và quy ước báo cáo',
  ],
  sections: [
    {
      heading: 'Dẫn nhập: s² có phải var không?',
      eyebrow: 'Câu trả lời ngắn',
      summary:
        'Có, nhưng cần nói đầy đủ: s² là phương sai mẫu; σ² là phương sai tổng thể hoặc tham số phương sai trong mô hình.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Trong thống kê, **variance** là tên của khái niệm phương sai. Ký hiệu phụ thuộc vào đối tượng đang nói tới. Với biến ngẫu nhiên tổng thể $X$, ta thường viết $\\operatorname{Var}(X)=\\sigma^2$. Với một mẫu hữu hạn $x_1,\\ldots,x_n$, phương sai mẫu thường được viết $s^2$. Vì vậy câu “$s^2=\\mathrm{var}$” đúng về ý tưởng nhưng chưa đủ chính xác về tầng ký hiệu.',
        },
        {
          type: 'formula',
          label: 'Phương sai tổng thể và phương sai mẫu',
          content: math`$$\operatorname{Var}(X)=\sigma^2=\mathbb E[(X-\mu)^2],\qquad s^2=\frac{1}{n-1}\sum_{t=1}^{n}(x_t-\bar x)^2$$`,
          note:
            'σ² là đại lượng lý thuyết chưa biết; s² là thống kê tính được từ dữ liệu và thường dùng để ước lượng σ².',
        },
        {
          type: 'comparison',
          columns: ['Đối tượng', 'Mean', 'Variance', 'Standard deviation'],
          rows: [
            ['Tổng thể / mô hình', '$\\mu=\\mathbb E[X]$', '$\\sigma^2=\\operatorname{Var}(X)$', '$\\sigma$'],
            ['Mẫu quan sát', '$\\bar x$', '$s^2$', '$s=\\sqrt{s^2}$'],
            ['pandas mặc định', '`.mean()`', '`.var(ddof=1)`', '`.std(ddof=1)`'],
          ],
        },
        {
          type: 'insight',
          tone: 'teal',
          title: 'Vì sao tài chính thường gọi σ là volatility?',
          content:
            'Trong mô hình xác suất, $\\sigma$ là độ lệch chuẩn của phần đổi mới ngẫu nhiên. Khi biến được quan sát là return, độ lệch chuẩn của return đo độ phân tán của mức lời/lỗ quanh trung bình. Tài chính gọi độ phân tán đó là volatility. Nói gọn: volatility thường là standard deviation của return, không phải variance của giá.',
        },
        {
          type: 'source-note',
          title: 'Đối chiếu định nghĩa',
          content:
            'NIST định nghĩa sample standard deviation với mẫu số n−1 và nhấn mạnh standard deviation là căn bậc hai của variance, nhờ đó trở về cùng đơn vị với dữ liệu ban đầu.',
        },
      ],
    },
    {
      heading: '1. Bản đồ ký hiệu: tổng thể, mẫu và ước lượng',
      eyebrow: 'Nền móng thống kê',
      summary:
        'Một ký hiệu tốt phải cho biết ta đang nói về chân lý của mô hình, một mẫu dữ liệu hay một ước lượng từ mẫu.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Giả sử $X$ là một biến ngẫu nhiên đại diện cho return ngày của một tài sản. Phân phối của $X$ có mean $\\mu$ và variance $\\sigma^2$, nhưng ta không quan sát toàn bộ phân phối. Ta chỉ có mẫu return $R_1,\\ldots,R_T$. Từ mẫu này, $\\bar R$ và $s_R^2$ được tính ra để ước lượng $\\mu$ và $\\sigma^2$. Dấu mũ như $\\widehat\\mu$ hoặc $\\widehat\\sigma$ nhắc người đọc rằng đây là kết quả ước lượng.',
        },
        {
          type: 'formula',
          label: 'Mean mẫu',
          content: math`$$\bar R=\widehat\mu_{\mathrm{daily}}=\frac{1}{T}\sum_{t=1}^{T}R_t$$`,
          note: 'Mean dùng T vì nó là trung bình số học của đúng T quan sát.',
        },
        {
          type: 'formula',
          label: 'Variance mẫu không chệch trong mô hình i.i.d.',
          content: math`$$s_R^2=\widehat{\sigma^2_{\mathrm{daily}}}=\frac{1}{T-1}\sum_{t=1}^{T}(R_t-\bar R)^2$$`,
          note:
            'Ta đã dùng dữ liệu để ước lượng một tham số là mean, nên còn T−1 bậc tự do.',
        },
        {
          type: 'paragraph',
          content:
            'Mẫu số $T-1$ là hiệu chỉnh Bessel cho ước lượng variance dưới các điều kiện cổ điển. Nó không có nghĩa mọi bài toán đều phải dùng $T-1$. Maximum likelihood của phân phối Gaussian dùng $T$; residual variance của hồi quy một nhân tố có intercept và beta dùng bậc tự do $T-2$. Điều cần giữ là: mẫu số phải khớp với bài toán ước lượng.',
        },
        {
          type: 'code',
          label: 'Python · thống kê mô tả',
          note: 'pandas dùng n−1 khi ddof=1',
          content: code`mean_daily = returns.mean()
var_daily  = returns.var(ddof=1)
std_daily  = returns.std(ddof=1)

# Kiểm tra đồng nhất:
assert np.allclose(std_daily**2, var_daily)`,
        },
      ],
    },
    {
      heading: '2. Từ giá hiệu chỉnh đến log-return',
      eyebrow: 'Biến đổi dữ liệu',
      summary:
        'Mô hình hóa return thay vì mức giá giúp so sánh các mã có thang giá khác nhau và biến tích lũy nhiều kỳ thành tổng đối với log-return.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Gọi $S_{i,t}^{\\mathrm{adj}}$ là giá đóng cửa hiệu chỉnh của cổ phiếu $i$ tại ngày $t$. Giá hiệu chỉnh cần phản ánh chia tách và phân phối để thay đổi cơ học của giá không bị nhận nhầm thành lời hoặc lỗ kinh tế. Với nghiên cứu lịch sử VN30, còn phải khóa danh sách thành viên theo thời gian để tránh survivorship bias.',
        },
        {
          type: 'formula',
          label: 'Simple return và log-return',
          content: math`$$r_{i,t}^{\mathrm{simple}}=\frac{S_{i,t}^{\mathrm{adj}}}{S_{i,t-1}^{\mathrm{adj}}}-1,\qquad R_{i,t}=\ln\!\left(\frac{S_{i,t}^{\mathrm{adj}}}{S_{i,t-1}^{\mathrm{adj}}}\right)$$`,
          note:
            'Log-return là log của tỷ số giá, không phải log của hiệu giá.',
        },
        {
          type: 'formula',
          label: 'Hai cách viết hoàn toàn tương đương',
          content: math`$$R_{i,t}=\ln S_{i,t}^{\mathrm{adj}}-\ln S_{i,t-1}^{\mathrm{adj}}=\ln(1+r_{i,t}^{\mathrm{simple}})$$`,
          note:
            'Với biến động nhỏ, ln(1+r) ≈ r; nhưng hai đại lượng không đồng nhất khi mức biến động lớn.',
        },
        {
          type: 'comparison',
          columns: ['Biến đổi', 'Đúng / sai', 'Lý do'],
          rows: [
            ['$\\ln(S_t/S_{t-1})$', 'Đúng', 'Log-return một kỳ'],
            ['$\\ln S_t-\\ln S_{t-1}$', 'Đúng', 'Đồng nhất logarit'],
            ['$\\ln(S_t-S_{t-1})$', 'Sai', 'Hiệu có thể âm hoặc bằng 0; không phải return'],
            ['$(S_t-S_{t-1})/S_{t-1}$', 'Đúng', 'Simple return'],
          ],
        },
        {
          type: 'code',
          label: 'Python · tạo return',
          note: 'Hai dòng log-return cho cùng kết quả',
          content: code`prices = prices.sort_index()
prices = prices.where(prices > 0)

log_returns_a = np.log(prices / prices.shift(1))
log_returns_b = np.log(prices).diff()
simple_returns = prices.pct_change(fill_method=None)

returns = log_returns_a.dropna(how="any")`,
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Không forward-fill thiếu giá một cách máy móc',
          content:
            'Nếu một mã ngừng giao dịch nhưng ta chép giá cũ sang ngày mới, return bằng 0 giả tạo sẽ kéo volatility xuống. Cần phân biệt ngày thị trường nghỉ, mã bị thiếu dữ liệu và mã thực sự không có giao dịch.',
        },
      ],
    },
    {
      heading: '3. Mean của return và drift của mô hình giá',
      eyebrow: 'Vị trí và xu hướng',
      summary:
        'Mean của log-return là một thống kê mẫu; drift μ trong SDE phụ thuộc phương trình đang được viết cho S hay cho ln S.',
      blocks: [
        {
          type: 'formula',
          label: 'Mean log-return ngày và năm',
          content: math`$$\bar R_i=\frac{1}{T}\sum_{t=1}^{T}R_{i,t},\qquad \widehat\mu_{\log,i}^{\mathrm{year}}=252\,\bar R_i$$`,
          note:
            '252 là quy ước số phiên giao dịch trong một năm; nghiên cứu cần công bố quy ước thực tế đã dùng.',
        },
        {
          type: 'paragraph',
          content:
            'Về kinh tế, $\\bar R_i$ là tốc độ tăng trưởng log trung bình trong một ngày của tài sản $i$. Nó không đảm bảo lợi suất tương lai và thường được ước lượng kém chính xác hơn volatility vì tín hiệu drift nhỏ so với nhiễu ngày. Vì vậy, không nên diễn giải một mean dương trong mẫu ngắn như “cổ phiếu chắc chắn tăng”.',
        },
        {
          type: 'formula',
          label: 'Geometric Brownian motion và hiệu chỉnh Itô',
          content: math`$$\frac{\mathrm dS_{i,t}}{S_{i,t}}=\mu_{S,i}\,\mathrm dt+\sigma_i\,\mathrm dW_{i,t}\quad\Longrightarrow\quad \mathrm d\ln S_{i,t}=\left(\mu_{S,i}-\frac12\sigma_i^2\right)\mathrm dt+\sigma_i\,\mathrm dW_{i,t}$$`,
          note:
            'Mean của log-return ước lượng μS−σ²/2, không trực tiếp là μS.',
        },
        {
          type: 'formula',
          label: 'Chuyển từ mean log-return sang drift của dS/S',
          content: math`$$\widehat\mu_{S,i}=252\,\bar R_i+\frac12\widehat\sigma_i^2$$`,
          note:
            'σi phải được biểu diễn theo năm để nhất quán đơn vị với drift năm.',
        },
        {
          type: 'code',
          label: 'Python · mean và drift',
          content: code`TRADING_DAYS = 252

mean_log_daily = returns.mean()
mean_log_annual = TRADING_DAYS * mean_log_daily
sigma_annual = np.sqrt(TRADING_DAYS) * returns.std(ddof=1)

mu_price_annual = mean_log_annual + 0.5 * sigma_annual.pow(2)`,
        },
      ],
    },
    {
      heading: '4. Variance, standard deviation và volatility',
      eyebrow: 'Độ phân tán và rủi ro',
      summary:
        'Variance thuận tiện cho đại số; volatility thuận tiện cho diễn giải vì có cùng đơn vị với return.',
      blocks: [
        {
          type: 'formula',
          label: 'Variance và volatility của return',
          content: math`$$s_i^2=\frac{1}{T-1}\sum_{t=1}^{T}(R_{i,t}-\bar R_i)^2,\qquad s_i=\sqrt{s_i^2}$$`,
          note:
            'Nếu return được viết dưới dạng số thập phân, s cũng là số thập phân; nhân 100 để báo cáo theo phần trăm.',
        },
        {
          type: 'paragraph',
          content:
            'Variance bình phương sai lệch nên luôn không âm và phạt mạnh quan sát xa mean. Nhưng đơn vị của variance là “return bình phương”, khó đọc trực giác. Standard deviation đưa đơn vị trở lại thang return. Trong thực hành tài chính, ta gọi standard deviation của return theo một horizon xác định là volatility. Vì vậy volatility phải luôn đi kèm tần suất: ngày, tháng hay năm.',
        },
        {
          type: 'formula',
          label: 'Năm hóa dưới giả định phương sai cộng theo thời gian',
          content: math`$$\widehat{\operatorname{Var}}_{\mathrm{year}}(R_i)=252\,s_{i,\mathrm{daily}}^2,\qquad \widehat\sigma_{i,\mathrm{year}}=\sqrt{252}\,s_{i,\mathrm{daily}}$$`,
          note:
            'Quy tắc này phù hợp khi log-return theo ngày gần như không tự tương quan và variance đủ ổn định.',
        },
        {
          type: 'insight',
          tone: 'rose',
          title: '√252 không phải định luật tự nhiên',
          content:
            'Nếu return có autocorrelation, volatility clustering, thay đổi chế độ hoặc horizon không cộng độc lập, variance nhiều kỳ còn chứa các covariance chéo theo thời gian. Khi đó nhân √252 chỉ là xấp xỉ mô hình, không phải phép đổi đơn vị vô điều kiện.',
        },
        {
          type: 'example',
          open: true,
          meta: 'Ví dụ đơn vị · volatility ngày sang năm',
          title: 'Một mã có độ lệch chuẩn return ngày 1,5%',
          prompt:
            'Giả sử $s_{daily}=0.015$. Tính variance ngày, variance năm và volatility năm theo quy tắc căn thời gian.',
          method: 'Bình phương để đi từ standard deviation sang variance; nhân 252 ở tầng variance; sau đó lấy căn.',
          steps: [
            { label: 'Variance ngày', content: '$s_{daily}^2=0.015^2=0.000225$.' },
            { label: 'Variance năm', content: '$s_{year}^2=252\\times0.000225=0.0567$.' },
            { label: 'Volatility năm', content: '$s_{year}=\\sqrt{0.0567}=0.2381$.' },
          ],
          result: '$\\boxed{\\widehat\\sigma_{year}\\approx23.81\\%}$',
          interpretation:
            'Con số 23,81% mô tả độ phân tán thường niên hóa của return dưới giả định scaling; nó không có nghĩa tài sản sẽ lỗ 23,81%.',
        },
        {
          type: 'code',
          label: 'Python · variance và volatility',
          content: code`var_daily = returns.var(ddof=1)
var_annual = TRADING_DAYS * var_daily

vol_daily = returns.std(ddof=1)
vol_annual = np.sqrt(TRADING_DAYS) * vol_daily

assert np.allclose(vol_annual.pow(2), var_annual)`,
        },
      ],
    },
    {
      heading: '5. Covariance, correlation và ma trận rủi ro',
      eyebrow: 'Thống kê đa biến',
      summary:
        'Rủi ro danh mục không được quyết định bởi volatility riêng lẻ mà còn bởi cách các tài sản đồng biến động.',
      blocks: [
        {
          type: 'formula',
          label: 'Sample covariance',
          content: math`$$s_{ij}=\widehat{\operatorname{Cov}}(R_i,R_j)=\frac{1}{T-1}\sum_{t=1}^{T}(R_{i,t}-\bar R_i)(R_{j,t}-\bar R_j)$$`,
          note:
            'Trên đường chéo i=j, covariance trở thành variance: sii=si².',
        },
        {
          type: 'formula',
          label: 'Correlation chuẩn hóa',
          content: math`$$\widehat\rho_{ij}=\frac{s_{ij}}{s_is_j},\qquad -1\leq\widehat\rho_{ij}\leq1$$`,
          note:
            'Correlation không có đơn vị; covariance giữ thang volatility của hai tài sản.',
        },
        {
          type: 'formula',
          label: 'Ma trận sample covariance viết đầy đủ',
          content: math`$$\widehat\Sigma=
\begin{bmatrix}
s_1^2&s_{12}&\cdots&s_{1d}\\
s_{21}&s_2^2&\cdots&s_{2d}\\
\vdots&\vdots&\ddots&\vdots\\
s_{d1}&s_{d2}&\cdots&s_d^2
\end{bmatrix}
=\frac{1}{T-1}\sum_{t=1}^{T}(R_t-\bar R)(R_t-\bar R)^\top$$`,
          note:
            'Mỗi hàng/cột là một tài sản; đường chéo là variance, ngoài đường chéo là covariance và sij=sji.',
        },
        {
          type: 'formula',
          label: 'Ví dụ trực quan với ba cổ phiếu',
          content: math`$$\widehat\Sigma=
\begin{bmatrix}
\sigma_1^2&\rho_{12}\sigma_1\sigma_2&\rho_{13}\sigma_1\sigma_3\\
\rho_{12}\sigma_1\sigma_2&\sigma_2^2&\rho_{23}\sigma_2\sigma_3\\
\rho_{13}\sigma_1\sigma_3&\rho_{23}\sigma_2\sigma_3&\sigma_3^2
\end{bmatrix}$$`,
          note:
            'Công thức cho thấy covariance đồng thời chứa mức volatility riêng và mức correlation của từng cặp.',
        },
        {
          type: 'example',
          open: true,
          meta: 'Ví dụ ma trận · ba tài sản',
          title: 'Đọc từng ô của một covariance matrix',
          prompt:
            'Giả sử volatility năm của ba mã là 20%, 30%, 25% và correlation lần lượt là $\\rho_{12}=0.50$, $\\rho_{13}=0.20$, $\\rho_{23}=-0.10$. Hãy lập ma trận covariance năm.',
          method:
            'Đường chéo dùng $\\sigma_i^2$; ngoài đường chéo dùng $\\rho_{ij}\\sigma_i\\sigma_j$.',
          steps: [
            { label: 'Đường chéo', content: '$0.20^2=0.0400$, $0.30^2=0.0900$, $0.25^2=0.0625$.' },
            { label: 'Covariance 1–2', content: '$0.50(0.20)(0.30)=0.0300$.' },
            { label: 'Covariance 1–3 và 2–3', content: '$0.20(0.20)(0.25)=0.0100$ và $-0.10(0.30)(0.25)=-0.0075$.' },
          ],
          result: '$\\widehat\\Sigma=\\begin{bmatrix}0.0400&0.0300&0.0100\\\\0.0300&0.0900&-0.0075\\\\0.0100&-0.0075&0.0625\\end{bmatrix}$',
          interpretation:
            'Ô âm không có nghĩa variance âm; nó chỉ nói hai tài sản có xu hướng biến động ngược chiều trong mẫu.',
        },
        {
          type: 'paragraph',
          content:
            'Nếu $w$ là vector tỷ trọng và $\\widehat\\Sigma$ là ma trận covariance, variance danh mục là $w^\\top\\widehat\\Sigma w$. Các phần tử ngoài đường chéo quyết định lợi ích đa dạng hóa. Hai mã đều biến động mạnh nhưng không đồng biến động hoàn toàn vẫn có thể tạo danh mục ít rủi ro hơn từng mã riêng lẻ.',
        },
        {
          type: 'formula',
          label: 'Variance danh mục',
          content: math`$$\widehat\sigma_p^2=w^\top\widehat\Sigma w=\sum_iw_i^2s_i^2+2\sum_{i<j}w_iw_js_{ij}$$`,
          note:
            'Đây cũng là lý do dạng toàn phương xuất hiện tự nhiên trong Quant Finance.',
        },
        {
          type: 'code',
          label: 'Python · covariance và rủi ro danh mục',
          content: code`cov_daily = returns.cov(ddof=1)
cov_annual = TRADING_DAYS * cov_daily
corr = returns.corr()

w = np.repeat(1 / returns.shape[1], returns.shape[1])
portfolio_var = float(w @ cov_annual.to_numpy() @ w)
portfolio_vol = np.sqrt(portfolio_var)`,
        },
      ],
    },
    {
      heading: '6. Ma trận xác định dương, bán xác định dương và trị riêng',
      eyebrow: 'Hình học ma trận',
      summary:
        'Trị riêng cho biết quadratic form có thể âm hay không, ma trận có khả nghịch hay không và Cholesky có tồn tại theo dạng chuẩn hay không.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Với ma trận thực $A$, quadratic form $x^\\top Ax$ chỉ phụ thuộc phần đối xứng $(A+A^\\top)/2$. Vì vậy khi nói positive definite trong LQ và covariance, ta xét ma trận đối xứng. Dấu của quadratic form quyết định một “chi phí bình phương” có thực sự không âm với mọi trạng thái hay không.',
        },
        {
          type: 'comparison',
          columns: ['Loại ma trận đối xứng', 'Định nghĩa bằng quadratic form', 'Điều kiện trị riêng'],
          rows: [
            ['Xác định dương · $A\\succ0$', '$x^\\top Ax>0$ với mọi $x\\neq0$', 'Mọi $\\lambda_i(A)>0$'],
            ['Bán xác định dương · $A\\succeq0$', '$x^\\top Ax\\geq0$ với mọi $x$', 'Mọi $\\lambda_i(A)\\geq0$'],
            ['Không xác định · indefinite', 'Có hướng cho giá trị dương và hướng cho giá trị âm', 'Có cả trị riêng dương và âm'],
            ['Xác định âm · $A\\prec0$', '$x^\\top Ax<0$ với mọi $x\\neq0$', 'Mọi $\\lambda_i(A)<0$'],
          ],
        },
        {
          type: 'formula',
          label: 'Phương trình đặc trưng để tìm trị riêng',
          content: math`$$\det(A-\lambda I_d)=0$$`,
          note:
            'Các nghiệm λ của characteristic equation là eigenvalues của A. Viết det(λI−A)=0 cũng tương đương vì hai định thức chỉ khác hệ số dấu (−1)^d.',
        },
        {
          type: 'formula',
          label: 'Tìm vector riêng sau khi đã có λ',
          content: math`$$(A-\lambda I_d)v=0,\qquad v\neq0$$`,
          note:
            'Mỗi nghiệm không tầm thường v là eigenvector ứng với λ; tương đương Av=λv.',
        },
        {
          type: 'example',
          open: true,
          meta: 'Ví dụ trị riêng · ma trận 2×2',
          title: 'Từ phương trình đặc trưng đến kết luận xác định dương',
          prompt:
            'Xét $A=\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$. Hãy tìm eigenvalues và xác định dấu của quadratic form.',
          method:
            'Lập $A-\\lambda I$, cho determinant bằng 0, giải polynomial rồi kiểm tra dấu toàn bộ eigenvalues.',
          steps: [
            {
              label: 'Lập phương trình đặc trưng',
              content: '$\\det(A-\\lambda I)=\\det\\begin{bmatrix}2-\\lambda&1\\\\1&2-\\lambda\\end{bmatrix}=(2-\\lambda)^2-1=0$.',
            },
            {
              label: 'Giải nghiệm',
              content: '$(2-\\lambda)^2=1$ nên $\\lambda_1=1$ và $\\lambda_2=3$.',
            },
            {
              label: 'Kết luận',
              content: 'Cả hai eigenvalues đều dương, vì vậy $A\\succ0$ và $x^\\top Ax>0$ với mọi $x\\neq0$.',
            },
          ],
          result: '$\\boxed{\\lambda(A)=\\{1,3\\}}\\quad\\Longrightarrow\\quad\\boxed{A\\succ0}$',
          interpretation:
            'Hai trị riêng là mức phạt theo hai principal directions. Trị riêng nhỏ nhất bằng 1 nên không có hướng khác 0 nào mang chi phí bằng 0.',
        },
        {
          type: 'formula',
          label: 'Phân rã trị riêng của ma trận đối xứng',
          content: math`$$A=U\Lambda U^\top,\qquad \Lambda=\operatorname{diag}(\lambda_1,\ldots,\lambda_d),\qquad x^\top Ax=\sum_{k=1}^{d}\lambda_k(u_k^\top x)^2$$`,
          note:
            'Trong đó: $\\Lambda$ (Lambda hoa) là ma trận đường chéo chứa các trị riêng $\\lambda_1,\\ldots,\\lambda_d$; ký hiệu $\\operatorname{diag}(\\lambda_1,\\ldots,\\lambda_d)$ thể hiện ma trận chỉ có các phần tử trên đường chéo chính khác 0.',
        },
        {
          type: 'comparison',
          columns: ['Ký hiệu trong phân rã', 'Tên gọi toán học', 'Ý nghĩa chi tiết trong bài toán'],
          rows: [
            [
              '$\\Lambda$ (Lambda hoa)',
              'Ma trận đường chéo (Diagonal Matrix)',
              'Ma trận cấp $d \\times d$ chứa toàn bộ các trị riêng $(\\lambda_1, \\dots, \\lambda_d)$ trên đường chéo chính, các vị trí còn lại ngoài đường chéo đều bằng $0$.',
            ],
            [
              '$\\operatorname{diag}(\\lambda_1, \\dots, \\lambda_d)$',
              'Toán tử / Ký hiệu đường chéo',
              'Ký hiệu thu gọn của ma trận đường chéo $\\begin{bmatrix}\\lambda_1 & 0 & \\dots & 0 \\\\ 0 & \\lambda_2 & \\dots & 0 \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ 0 & 0 & \\dots & \\lambda_d\\end{bmatrix}$.',
            ],
            [
              '$U$',
              'Ma trận trực giao (Orthogonal Matrix)',
              'Ma trận cấp $d \\times d$ chứa các vector riêng chuẩn hóa $(u_1, \\dots, u_d)$ xếp theo cột, thỏa mãn $U^\\top U = I_d$.',
            ],
            [
              '$\\lambda_k$',
              'Trị riêng (Eigenvalue)',
              'Mức phạt hoặc độ biến động (variance) tương ứng theo hướng rủi ro thứ $k$.',
            ],
            [
              '$u_k$',
              'Vector riêng (Eigenvector)',
              'Hướng rủi ro chính (principal direction) thứ $k$, vuông góc với các hướng còn lại.',
            ],
          ],
        },
        {
          type: 'paragraph',
          content:
            'Covariance lý thuyết luôn PSD vì $a^\\top\\Sigma a=\\operatorname{Var}(a^\\top R)\\geq0$. Nó có thể không PD nếu một tài sản là tổ hợp tuyến tính của các tài sản khác hoặc số quan sát không đủ so với số chiều. Khi đó có hướng danh mục khác 0 nhưng sample variance bằng 0.',
        },
        {
          type: 'formula',
          label: 'Kiểm tra nhanh ma trận 2×2',
          content: math`$$A=\begin{bmatrix}a&b\\b&c\end{bmatrix}\succ0\iff a>0\ \text{và}\ ac-b^2>0$$`,
          note:
            'Đây là Sylvester criterion: mọi leading principal minor phải dương đối với positive definite.',
        },
        {
          type: 'comparison',
          columns: ['Ma trận trong đề tài', 'Tính chất mong muốn', 'Lý do'],
          rows: [
            ['$R$', '$R\\succ0$', 'Khả nghịch để $\\alpha_t=\\frac12R^{-1}p_t$ xác định duy nhất'],
            ['$Q=\\lambda_{risk}\\Sigma_{annual}$', '$Q\\succeq0$', 'Inventory risk không âm; có thể có hướng zero-risk trong sample'],
            ['$A=a_TI$', '$A\\succ0$ nếu $a_T>0$', 'Mọi terminal inventory khác 0 đều bị phạt'],
            ['$\\Sigma$', '$\\Sigma\\succeq0$', 'Mọi variance danh mục đều không âm'],
          ],
        },
        {
          type: 'formula',
          label: 'Condition number đối với SPD matrix',
          content: math`$$\kappa_2(A)=\frac{\lambda_{\max}(A)}{\lambda_{\min}(A)}$$`,
          note:
            'κ gần 1 là cân bằng tốt; κ rất lớn nghĩa là gần suy biến và nghiệm số nhạy với sai số dữ liệu.',
        },
        {
          type: 'code',
          label: 'Python · kiểm tra PSD/PD và conditioning',
          content: code`A = 0.5 * (A + A.T)  # đối xứng hóa sai số số học
eigvals = np.linalg.eigvalsh(A)
tol = 1e-10

is_psd = bool(eigvals.min() >= -tol)
is_pd = bool(eigvals.min() > tol)
condition_number = np.linalg.cond(A)

print({
    "min_eigenvalue": eigvals.min(),
    "max_eigenvalue": eigvals.max(),
    "is_psd": is_psd,
    "is_pd": is_pd,
    "condition_number": condition_number,
})`,
        },
        {
          type: 'insight',
          tone: 'rose',
          title: 'Không dùng det(A)>0 để kết luận A xác định dương',
          content:
            'Định thức dương chỉ nói tích các trị riêng dương. Một ma trận có hai trị riêng âm vẫn có determinant dương nhưng không positive definite. Với ma trận đối xứng, hãy kiểm toàn bộ `eigvalsh`, Cholesky hoặc Sylvester criterion.',
        },
      ],
    },
    {
      heading: '7. Phân rã Cholesky và sinh nhiễu tương quan',
      eyebrow: 'Đại số tuyến tính xác suất',
      summary:
        'Cholesky biến các cú sốc Gaussian độc lập thành vector cú sốc có đúng covariance chéo của VN30.',
      blocks: [
        {
          type: 'formula',
          label: 'Cholesky factor',
          content: math`$$\Sigma=LL^\top,\qquad L=\begin{bmatrix}\ell_{11}&0&\cdots&0\\\ell_{21}&\ell_{22}&\cdots&0\\\vdots&\vdots&\ddots&\vdots\\\ell_{d1}&\ell_{d2}&\cdots&\ell_{dd}\end{bmatrix}$$`,
          note:
            'Dạng Cholesky chuẩn với đường chéo dương là duy nhất khi Σ đối xứng xác định dương.',
        },
        {
          type: 'formula',
          label: 'Từ chuẩn độc lập đến chuẩn tương quan',
          content: math`$$Z\sim\mathcal N(0,I_d),\qquad \varepsilon=LZ\quad\Longrightarrow\quad \varepsilon\sim\mathcal N(0,\Sigma)$$`,
          note:
            'Vì Cov(LZ)=L Cov(Z)Lᵀ=LLᵀ=Σ.',
        },
        {
          type: 'formula',
          label: 'Brownian increment nhiều tài sản',
          content: math`$$\Delta W_k=\sqrt{\Delta t}\,Z_k,\qquad L\Delta W_k\sim\mathcal N(0,\Sigma\Delta t)$$`,
          note:
            'Nhân √Δt để variance của increment tỷ lệ với độ dài bước thời gian.',
        },
        {
          type: 'example',
          meta: 'Ví dụ Cholesky · hai tài sản',
          title: 'Một cú sốc độc lập trở thành cú sốc có tương quan',
          prompt:
            'Với $\\Sigma=\\begin{bmatrix}4&2\\\\2&3\\end{bmatrix}$, tìm Cholesky factor và kiểm tra covariance.',
          method: 'Giải lần lượt các phần tử của lower triangular L sao cho $LL^\\top=\\Sigma$.',
          steps: [
            { label: 'Phần tử đầu', content: '$\\ell_{11}=\\sqrt4=2$.' },
            { label: 'Phần tử dưới', content: '$\\ell_{21}=2/\\ell_{11}=1$.' },
            { label: 'Đường chéo thứ hai', content: '$\\ell_{22}=\\sqrt{3-1^2}=\\sqrt2$.' },
          ],
          result: '$L=\\begin{bmatrix}2&0\\\\1&\\sqrt2\\end{bmatrix},\\quad LL^\\top=\\begin{bmatrix}4&2\\\\2&3\\end{bmatrix}$',
          interpretation:
            'Cùng một thành phần Z1 đi vào cả hai tài sản qua cột đầu của L, tạo covariance dương bằng 2.',
        },
        {
          type: 'paragraph',
          content:
            'Nếu covariance chỉ PSD và có eigenvalue bằng 0, `np.linalg.cholesky` có thể thất bại vì hàm yêu cầu positive definite. Hai lựa chọn có ý nghĩa khác nhau: dùng spectral square root $U\\Lambda_+^{1/2}U^\\top$ để giữ hạng suy biến, hoặc thêm jitter $\\varepsilon I$ để làm mọi eigenvalue tăng thêm $\\varepsilon$. Jitter giúp số học nhưng đã thay đổi covariance, dù rất nhỏ.',
        },
        {
          type: 'formula',
          label: 'Spectral square root và jitter',
          content: math`$$\Sigma^{1/2}=U\operatorname{diag}(\sqrt{\max(\lambda_i,0)})U^\top,\qquad \Sigma_{\mathrm{stab}}=\Sigma+\varepsilon I$$`,
          note:
            'Eigenvalue clipping sửa các trị riêng âm nhỏ do sai số; jitter nâng tất cả các hướng, kể cả hướng thật sự có variance 0.',
        },
        {
          type: 'code',
          label: 'Python · đúng với notebook của đề tài',
          content: code`returns = np.log(prices).diff().dropna()
cov_daily = returns.cov().to_numpy()

jitter = 1e-10
cov_daily_stable = cov_daily + jitter * np.eye(cov_daily.shape[0])
chol_daily = np.linalg.cholesky(cov_daily_stable)

eigvals = np.linalg.eigvalsh(cov_daily_stable)
cond = np.linalg.cond(cov_daily_stable)

# Nếu dùng time scale theo năm:
cov_annual = 252 * cov_daily_stable
chol_annual = np.sqrt(252) * chol_daily
assert np.allclose(chol_annual @ chol_annual.T, cov_annual)`,
        },
      ],
    },
    {
      heading: '8. Sigma ID và Sigma 0 trong đúng mô hình của đề tài',
      eyebrow: 'Private/common diffusion',
      summary:
        'Trong đề tài, Sigma ID và Sigma 0 là diffusion loadings của inventory state; chúng không tự động là volatility thị trường ước lượng bằng hồi quy return.',
      blocks: [
        {
          type: 'formula',
          label: 'Dynamics của agent i',
          content: math`$$\mathrm dX_t^i=-\alpha_t^i\,\mathrm dt+\Sigma_{\mathrm{id}}\,\mathrm dW_t^i+\Sigma_0\,\mathrm dW_t^0$$`,
          note:
            'Wᶦ là Brownian riêng của agent i; W⁰ là Brownian chung mà mọi agent cùng nhận.',
        },
        {
          type: 'comparison',
          columns: ['Ký hiệu', 'Shape', 'Vai trò'],
          rows: [
            ['$W_t^i$', '$\\mathbb R^d$', 'Nhiễu riêng; khác nhau giữa các agent'],
            ['$W_t^0$', '$\\mathbb R^d$', 'Nhiễu chung; cùng realization giữa các agent'],
            ['$\\Sigma_{id}$', '$d\\times d$', 'Scale và correlation của private state shocks'],
            ['$\\Sigma_0$', '$d\\times d$', 'Scale và correlation của common state shocks'],
            ['$\\sigma_X,\\sigma_0$', 'Vô hướng', 'Phiên bản scalar, thường nhân $I_d$ hoặc áp theo từng chiều'],
          ],
        },
        {
          type: 'formula',
          label: 'Instantaneous covariance của một agent',
          content: math`$$\operatorname{Cov}(\mathrm dX_t^i\mid\mathcal F_t)=\left(\Sigma_{\mathrm{id}}\Sigma_{\mathrm{id}}^\top+\Sigma_0\Sigma_0^\top\right)\mathrm dt$$`,
          note:
            'Hai nguồn variance cộng vì private và common Brownian được giả định độc lập.',
        },
        {
          type: 'formula',
          label: 'Cross-agent covariance chỉ đến từ common noise',
          content: math`$$\operatorname{Cov}(\mathrm dX_t^i,\mathrm dX_t^j\mid\mathcal F_t)=\Sigma_0\Sigma_0^\top\,\mathrm dt,\qquad i\neq j$$`,
          note:
            'Private shocks độc lập giữa agent nên không tạo covariance chéo có điều kiện.',
        },
        {
          type: 'paragraph',
          content:
            'Ý nghĩa kinh tế: private noise làm inventory của các agent phân tán quanh quỹ đạo trung bình, ví dụ sai lệch fill hoặc order-flow riêng. Common noise làm cả population cùng lệch hướng, ví dụ một cú sốc thanh khoản hoặc thị trường chung. Vì common shock không triệt tiêu khi lấy trung bình nhiều agent, nó đặc biệt quan trọng trong Mean Field Game và Mean Field Control.',
        },
        {
          type: 'formula',
          label: 'Hiệu chỉnh đang dùng trong B4 của notebook',
          content: math`$$LL^\top=\Sigma_{\mathrm{VN30,annual}},\qquad \Sigma_{\mathrm{id}}=s_{\mathrm{diff}}L,\qquad \Sigma_0=s_{\mathrm{diff}}s_{\mathrm{common}}L$$`,
          note:
            'Đề tài dùng geometry tương quan VN30 qua L, sau đó nhân các scenario scales của state diffusion.',
        },
        {
          type: 'formula',
          label: 'Giá trị mặc định của B4',
          content: math`$$s_{\mathrm{diff}}=0.05,\qquad s_{\mathrm{common}}=0.25,\qquad \Sigma_{\mathrm{id}}=0.05L,\qquad \Sigma_0=0.0125L$$`,
          note:
            '0.25 là tỷ lệ common so với private diffusion, không phải common diffusion tuyệt đối bằng 0.25.',
        },
        {
          type: 'formula',
          label: 'Covariance suy ra trong B4',
          content: math`$$\operatorname{Cov}(\mathrm dX_t^i\mid\mathcal F_t)=\left(0.05^2+0.0125^2\right)\Sigma_{\mathrm{VN30,annual}}\,\mathrm dt,\qquad \operatorname{Cov}(\mathrm dX_t^i,\mathrm dX_t^j\mid\mathcal F_t)=0.0125^2\Sigma_{\mathrm{VN30,annual}}\,\mathrm dt$$`,
          note:
            'Công thức này cho thấy chính xác dữ liệu VN30 đi vào state noise qua covariance geometry như thế nào.',
        },
        {
          type: 'comparison',
          columns: ['Khối thực nghiệm', 'Private diffusion', 'Common diffusion', 'Có dùng Cholesky VN30?'],
          rows: [
            ['B3B Full-MV', '$0.03I_d$', '$0.01I_d$', 'Không trong block này'],
            ['B4 adverse crowding', '$0.05L$', '$0.0125L$', 'Có'],
            ['Factor model của return', '$\\sigma_{ID,i}$ residual', '$\\beta_i\\sigma_0$', 'Là cách phân rã khác'],
          ],
        },
        {
          type: 'insight',
          tone: 'rose',
          title: 'Hai hệ sigma không được nhập làm một',
          content:
            '$\\sigma_{ID,i}$ và $\\beta_i\\sigma_0$ trong factor regression mô tả volatility return của cổ phiếu. $\\Sigma_{id}$ và $\\Sigma_0$ trong SDE của đề tài mô tả diffusion của inventory/state. Dữ liệu VN30 cung cấp geometry cho cả hai cách xây dựng, nhưng đơn vị và đối tượng ngẫu nhiên khác nhau.',
        },
      ],
    },
    {
      heading: '9. Ký hiệu phân phối, dấu ~ và Gaussian đa biến',
      eyebrow: 'Ngôn ngữ xác suất',
      summary:
        'Dấu ngã mô tả luật phân phối; nó không có nghĩa “xấp xỉ bằng”.',
      blocks: [
        {
          type: 'comparison',
          columns: ['Ký hiệu', 'Cách đọc', 'Ý nghĩa'],
          rows: [
            ['$X\\sim\\mathcal D$', 'X có phân phối D', 'Luật xác suất của X là D'],
            ['$X\\sim\\mathcal N(\\mu,\\sigma^2)$', 'X phân phối chuẩn', 'Mean μ, variance σ²'],
            ['$Z\\sim\\mathcal N(0,I_d)$', 'Chuẩn đa biến tiêu chuẩn', 'Mean vector 0, covariance identity'],
            ['$X\\overset d=Y$', 'Bằng nhau theo phân phối', 'Có cùng law, không nhất thiết cùng realization'],
            ['$X\\approx Y$', 'X xấp xỉ Y', 'Gần nhau theo nghĩa được nêu'],
            ['$X\\perp Y$', 'X độc lập Y', 'Joint law phân tích thành tích các marginal laws'],
            ['$X_1,\\ldots,X_n\\overset{iid}{\\sim}\\mathcal D$', 'Độc lập, cùng phân phối', 'Giả định thường dùng trong thống kê mẫu'],
          ],
        },
        {
          type: 'formula',
          label: 'Gaussian đa biến',
          content: math`$$X\sim\mathcal N(\mu,\Sigma),\qquad \mathbb E[X]=\mu,\qquad \operatorname{Cov}(X)=\Sigma$$`,
          note:
            'μ là vector d chiều; Σ là ma trận d×d đối xứng PSD.',
        },
        {
          type: 'comparison',
          columns: ['Phân phối', 'Ký hiệu thường gặp', 'Vai trò trong Quant Finance'],
          rows: [
            ['Normal / Gaussian', '$X\\sim\\mathcal N(\\mu,\\sigma^2)$', 'Innovation và Brownian increment'],
            ['Multivariate normal', '$X\\sim\\mathcal N(\\mu,\\Sigma)$', 'Cú sốc nhiều tài sản có covariance chéo'],
            ['Lognormal', '$S_t\\sim\\operatorname{Lognormal}(m,v)$', 'Giá GBM dương vì $\\ln S_t$ là Gaussian'],
            ['Student-t', '$X\\sim t_\\nu$', 'Mô hình đuôi dày hơn Gaussian cho return'],
            ['Chi-square', '$X\\sim\\chi_\\nu^2$', 'Phân phối lấy mẫu của variance dưới giả định Gaussian'],
            ['Empirical distribution', '$\\widehat F_n$', 'Law được tạo trực tiếp từ dữ liệu/particles, không ép dạng tham số'],
          ],
        },
        {
          type: 'formula',
          label: 'GBM dẫn tới phân phối lognormal của giá',
          content: math`$$\ln S_t\sim\mathcal N\!\left(\ln S_0+\left(\mu-\frac12\sigma^2\right)t,\sigma^2t\right)\quad\Longrightarrow\quad S_t\ \text{có phân phối lognormal}$$`,
          note:
            'Giá theo GBM luôn dương; log-return Gaussian không đồng nghĩa mức giá Gaussian.',
        },
        {
          type: 'formula',
          label: 'Linear transformation của Gaussian',
          content: math`$$X\sim\mathcal N(\mu,\Sigma)\quad\Longrightarrow\quad AX+b\sim\mathcal N(A\mu+b,A\Sigma A^\top)$$`,
          note:
            'Đây là cơ sở toán học của cả Cholesky simulation và portfolio return wᵀR.',
        },
        {
          type: 'paragraph',
          content:
            'Trong Quant Finance, Gaussian thuận tiện vì được đặc trưng hoàn toàn bởi mean và covariance, đồng thời đóng kín dưới phép biến đổi tuyến tính. Nhưng return thực tế thường có đuôi dày, bất đối xứng và volatility clustering. Vì vậy Gaussian trong đề tài chủ yếu là mô hình cho Brownian increments và Monte Carlo innovations, không phải tuyên bố rằng mọi return VN30 đều phân phối chuẩn hoàn hảo.',
        },
        {
          type: 'code',
          label: 'Python · ký hiệu phân phối thành lệnh lấy mẫu',
          content: code`rng = np.random.default_rng(42)
n_paths, d = 10_000, 3

# Z_k ~ N(0, I_d)
Z = rng.standard_normal((n_paths, d))

# epsilon_k ~ N(0, Sigma)
L = np.linalg.cholesky(Sigma)
epsilon = Z @ L.T

print(epsilon.mean(axis=0))
print(np.cov(epsilon, rowvar=False))  # xấp xỉ Sigma khi n_paths lớn`,
        },
      ],
    },
    {
      heading: '10. Brownian motion, kỳ vọng có điều kiện và empirical law',
      eyebrow: 'Stochastic process · Mean field',
      summary:
        'Đề tài không chỉ dùng biến ngẫu nhiên tĩnh mà dùng cả quá trình thông tin phát triển theo thời gian và phân phối của một quần thể agent.',
      blocks: [
        {
          type: 'formula',
          label: 'Định nghĩa increment của Brownian motion chuẩn',
          content: math`$$W_0=0,\qquad W_t-W_s\sim\mathcal N(0,(t-s)I_d),\quad 0\leq s<t$$`,
          note:
            'Các increments trên những khoảng thời gian không giao nhau độc lập và quỹ đạo liên tục gần như chắc chắn.',
        },
        {
          type: 'formula',
          label: 'Rời rạc hóa trên lưới thời gian',
          content: math`$$\Delta W_k=W_{t_{k+1}}-W_{t_k}=\sqrt{\Delta t}\,\xi_k,\qquad \xi_k\overset{iid}{\sim}\mathcal N(0,I_d)$$`,
          note:
            'Không nhân Δt; phải nhân √Δt vì variance của Brownian increment bằng Δt.',
        },
        {
          type: 'comparison',
          columns: ['Ký hiệu', 'Ý nghĩa trong đề tài'],
          rows: [
            ['$\\mathbb E[X]$', 'Kỳ vọng không điều kiện qua mọi nguồn ngẫu nhiên'],
            ['$\\mathbb E[X\\mid\\mathcal F_t]$', 'Dự báo tốt nhất theo bình phương sai số với thông tin đến thời điểm t'],
            ['$\\mathcal F_t$', 'Filtration: toàn bộ thông tin có sẵn đến t'],
            ['$\\mathcal F_t^0$', 'Thông tin sinh bởi common noise đến t'],
            ['$\\mathcal L(X_t)$', 'Law/phân phối của state X tại t'],
            ['$\\mathcal L(X_t\\mid\\mathcal F_t^0)$', 'Conditional law khi đã biết common-noise history'],
          ],
        },
        {
          type: 'formula',
          label: 'Empirical law của N agent',
          content: math`$$\mu_t^N=\frac1N\sum_{i=1}^{N}\delta_{X_t^i}$$`,
          note:
            'δx là point mass tại x; μtN là phân phối thực nghiệm, không phải chỉ riêng mean inventory.',
        },
        {
          type: 'formula',
          label: 'Mean và covariance của empirical population',
          content: math`$$\bar X_t^N=\int x\,\mu_t^N(\mathrm dx)=\frac1N\sum_{i=1}^{N}X_t^i,\qquad S_{X,t}=\frac1{N-1}\sum_{i=1}^{N}(X_t^i-\bar X_t^N)(X_t^i-\bar X_t^N)^\top$$`,
          note:
            'Mean field có thể phụ thuộc mean, dispersion hoặc toàn bộ empirical law.',
        },
        {
          type: 'paragraph',
          content:
            'Khi không có common noise và các agent đủ độc lập, averaging làm private noise giảm theo quy mô quần thể. Khi có common noise, tất cả agent cùng nhận một realization nên thành phần này không mất đi khi $N$ tăng. Vì vậy giới hạn mean-field với common noise thường là một conditional distribution ngẫu nhiên theo $\\mathcal F_t^0$, không phải một phân phối tất định.',
        },
        {
          type: 'formula',
          label: 'Monte Carlo mean và standard error',
          content: math`$$\widehat m_N=\frac1N\sum_{i=1}^{N}Y_i,\qquad \operatorname{SE}(\widehat m_N)\approx\frac{s_Y}{\sqrt N}$$`,
          note:
            'Tăng số particle giảm sampling error theo tốc độ căn N, không theo N.',
        },
        {
          type: 'formula',
          label: 'Khoảng tin cậy Monte Carlo xấp xỉ 95%',
          content: math`$$\widehat m_N\pm1.96\,\frac{s_Y}{\sqrt N}$$`,
          note:
            'Dựa trên CLT và phù hợp khi số path đủ lớn, variance hữu hạn và dependence đã được xử lý đúng.',
        },
        {
          type: 'paragraph',
          content:
            'Trong thí nghiệm Deep BSDE, nhiều seed không chỉ để “chạy lại cho chắc”. Mean qua seed ước lượng hiệu năng kỳ vọng của quy trình huấn luyện; standard deviation qua seed đo độ bất ổn thuật toán; confidence interval mô tả độ chính xác của mean đã báo cáo. Path-level samples trong cùng một model run và seed-level results không phải lúc nào cũng độc lập tương đương, nên cần nêu rõ đơn vị lấy mẫu.',
        },
        {
          type: 'insight',
          tone: 'teal',
          title: 'q và q⁰ trong BSDE là gì?',
          content:
            'Trong backward equation $\\mathrm dp_t=-f_t\\mathrm dt+q_t\\mathrm dW_t+q_t^0\\mathrm dW_t^0$, $q_t$ và $q_t^0$ là martingale loadings giúp adjoint phản ứng với thông tin private/common mới xuất hiện. Chúng không phải inventory-risk matrix $Q$, cũng không phải scalar q trong một phương trình Riccati.',
        },
      ],
    },
    {
      heading: '11. Từ VN30 đến common và idiosyncratic volatility',
      eyebrow: 'Mô hình nhân tố',
      summary:
        'Biến động của một cổ phiếu có thể được phân rã thành phần đi cùng thị trường và phần riêng còn lại sau khi đã kiểm soát thị trường.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Gọi $R_{0,t}$ là log-return của chỉ số VN30 và $R_{i,t}$ là log-return cổ phiếu $i$. Mô hình thị trường một nhân tố viết $R_{i,t}=\\alpha_i+\\beta_iR_{0,t}+\\varepsilon_{i,t}$. Thành phần $\\beta_iR_{0,t}$ là biến động chung quan sát qua chỉ số; residual $\\varepsilon_{i,t}$ là phần biến động không được nhân tố VN30 giải thích.',
        },
        {
          type: 'formula',
          label: 'Hồi quy nhân tố VN30',
          content: math`$$R_{i,t}=\alpha_i+\beta_iR_{0,t}+\varepsilon_{i,t},\qquad \widehat\beta_i=\frac{\widehat{\operatorname{Cov}}(R_i,R_0)}{\widehat{\operatorname{Var}}(R_0)}$$`,
          note:
            'β đo độ nhạy của return cổ phiếu với một đơn vị biến động return của VN30.',
        },
        {
          type: 'formula',
          label: 'Phân rã variance khi Cov(R₀, εi)=0',
          content: math`$$\operatorname{Var}(R_i)=\beta_i^2\operatorname{Var}(R_0)+\operatorname{Var}(\varepsilon_i)$$`,
          note:
            'OLS có intercept làm residual trực giao với regressor trong mẫu, tạo phân rã variance mẫu tương ứng.',
        },
        {
          type: 'comparison',
          columns: ['Đại lượng', 'Công thức năm hóa', 'Ý nghĩa kinh tế'],
          rows: [
            ['$\\sigma_0$', '$\\operatorname{Std}(R_0)\\sqrt{252}$', 'Mức bất định của nhân tố VN30'],
            ['$\\sigma_{common,i}$', '$|\\beta_i|\\sigma_0$', 'Phần volatility của mã i do nhân tố VN30'],
            ['$\\sigma_{ID,i}$', '$\\operatorname{Std}(\\widehat\\varepsilon_i)\\sqrt{252}$', 'Rủi ro riêng chưa được VN30 giải thích'],
            ['$R_i^2$', '$1-SSR_i/TSS_i$', 'Tỷ lệ variance được mô hình giải thích'],
          ],
        },
        {
          type: 'insight',
          tone: 'teal',
          title: 'Vì sao volatility lại có chỉ số i?',
          content:
            'Mỗi cổ phiếu có cấu trúc kinh doanh, đòn bẩy, thanh khoản và mức nhạy thị trường khác nhau. Do đó $\\beta_i$, $\\sigma_{common,i}$ và $\\sigma_{ID,i}$ thay đổi theo i. Chỉ viết một $\\sigma_{ID}$ chung là một giả định đồng nhất hóa để mô hình gọn hơn, không phải sự thật tự động của dữ liệu.',
        },
        {
          type: 'paragraph',
          content:
            'Về kinh tế, common risk khó loại bỏ chỉ bằng cách nắm giữ nhiều cổ phiếu vì nó đẩy nhiều tài sản cùng hướng. Idiosyncratic risk có thể được giảm bằng đa dạng hóa nếu residual giữa các mã không đồng biến động mạnh. Tuy nhiên nghiên cứu thực nghiệm cho thấy bản thân idiosyncratic volatility cũng có thể có cấu trúc nhân tố, nên “riêng” không đồng nghĩa “hoàn toàn độc lập”.',
        },
      ],
    },
    {
      heading: '12. Hai cách hiệu chỉnh sigma₀ và sigmaID từ return',
      eyebrow: 'Ước lượng',
      summary:
        'Cách factor regression thực tế hơn; cách average covariance phù hợp với mô hình đồng nhất nhưng đặt giả định mạnh hơn.',
      blocks: [
        {
          type: 'steps',
          title: 'Cách A · dùng chỉ số VN30 làm nhân tố quan sát',
          items: [
            'Tính log-return VN30 $R_{0,t}$ và return từng mã $R_{i,t}$ trên cùng lịch giao dịch.',
            'Hồi quy từng mã: $R_{i,t}=\\alpha_i+\\beta_iR_{0,t}+\\varepsilon_{i,t}$.',
            'Đặt $\\widehat\\sigma_0=\\operatorname{Std}(R_0)\\sqrt{252}$.',
            'Đặt $\\widehat\\sigma_{common,i}=|\\widehat\\beta_i|\\widehat\\sigma_0$.',
            'Đặt $\\widehat\\sigma_{ID,i}=\\operatorname{Std}(\\widehat\\varepsilon_i)\\sqrt{252}$.',
          ],
        },
        {
          type: 'code',
          label: 'Python · OLS với statsmodels',
          note: 'Intercept phải được thêm rõ ràng',
          content: code`import statsmodels.api as sm

joined = stock_returns.join(vn30_return.rename("VN30")).dropna()
market = joined["VN30"]
sigma_0 = market.std(ddof=1) * np.sqrt(252)

rows = []
for ticker in stock_returns.columns:
    y = joined[ticker]
    X = sm.add_constant(market)
    fit = sm.OLS(y, X, missing="drop").fit()

    beta_i = fit.params["VN30"]
    sigma_id_i = np.sqrt(fit.mse_resid * 252)
    sigma_common_i = abs(beta_i) * sigma_0

    rows.append({
        "ticker": ticker,
        "alpha_daily": fit.params["const"],
        "beta": beta_i,
        "r_squared": fit.rsquared,
        "sigma_common": sigma_common_i,
        "sigma_id": sigma_id_i,
    })

factor_result = pd.DataFrame(rows).set_index("ticker")`,
        },
        {
          type: 'paragraph',
          content:
            'Ở đây `fit.mse_resid` là residual variance đã chia theo residual degrees of freedom. Với một intercept và một beta, bậc tự do residual thường là $T-2$. Cách dùng trực tiếp kết quả hồi quy giảm nguy cơ tự viết nhầm mẫu số.',
        },
        {
          type: 'formula',
          label: 'Cách B · mô hình common noise tải bằng nhau',
          content: math`$$R_{i,t}=\mu_i\Delta t+\sigma_0\Delta W_t^0+\sigma_{ID,i}\Delta W_t^i$$`,
          note:
            'Nếu Brownian riêng độc lập và mọi mã có cùng hệ số tải common bằng 1, covariance chéo bằng σ₀²Δt.',
        },
        {
          type: 'formula',
          label: 'Ước lượng từ trung bình covariance ngoài đường chéo',
          content: math`$$\widehat\sigma_0^2=\frac{1}{N(N-1)}\sum_{i\ne j}\widehat\Sigma_{ij},\qquad \widehat\sigma_{ID,i}^2=\widehat\Sigma_{ii}-\widehat\sigma_0^2$$`,
          note:
            'Σ phải ở cùng tần suất với sigma cần báo cáo; nếu Σ đã năm hóa thì không nhân 252 lần nữa.',
        },
        {
          type: 'code',
          label: 'Python · equal-loading estimator',
          content: code`Sigma = 252 * returns.cov(ddof=1)
values = Sigma.to_numpy()
off_diag = ~np.eye(values.shape[0], dtype=bool)

sigma0_sq = values[off_diag].mean()
if sigma0_sq < 0:
    raise ValueError("Average covariance âm: equal-loading model không phù hợp.")

sigma_0_equal = np.sqrt(sigma0_sq)
sigma_id_sq = pd.Series(np.diag(values) - sigma0_sq, index=Sigma.index)

if (sigma_id_sq < 0).any():
    raise ValueError("Có variance riêng âm: cần xem lại mô hình hoặc dữ liệu.")

sigma_id_equal_model = np.sqrt(sigma_id_sq)`,
        },
        {
          type: 'comparison',
          columns: ['Tiêu chí', 'Factor VN30', 'Average covariance'],
          rows: [
            ['Hệ số tải', 'Mỗi mã có $\\beta_i$', 'Mặc định bằng 1'],
            ['Nhân tố chung', 'Quan sát qua VN30', 'Ẩn, suy ra từ covariance'],
            ['Độ linh hoạt', 'Cao hơn', 'Thấp hơn'],
            ['Phù hợp', 'Thực nghiệm từng mã', 'Mô hình lý thuyết đồng nhất'],
          ],
        },
      ],
    },
    {
      heading: '13. Từ rủi ro thống kê đến hàm mục tiêu LQ',
      eyebrow: 'Stochastic control',
      summary:
        'Các dạng toàn phương trong hàm mục tiêu là cách đưa quy mô giao dịch, inventory risk và terminal inventory vào một thước đo chi phí.',
      blocks: [
        {
          type: 'formula',
          label: 'Hàm mục tiêu LQ cơ bản',
          content: math`$$J(\alpha)=\mathbb E\!\left[\int_0^T\left(\alpha_t^\top R\alpha_t+X_t^\top QX_t\right)\mathrm dt+X_T^\top AX_T\right]$$`,
          note:
            'R, Q và A là ma trận trọng số; chúng không phải sigma₀ hay sigmaID.',
        },
        {
          type: 'paragraph',
          content:
            'Trong triển khai giao dịch, $\\alpha_t$ là tốc độ giao dịch và $X_t$ là inventory. Hạng $\\alpha_t^\\top R\\alpha_t$ mô tả chi phí thực thi tăng phi tuyến khi giao dịch gấp; $X_t^\\top QX_t$ phạt rủi ro giữ vị thế; $X_T^\\top AX_T$ phạt lượng hàng chưa xử lý ở cuối kỳ. Đây là quadratic forms. Nếu ma trận xác định dương, chúng là bình phương của weighted norms chứ bản thân không phải norm.',
        },
        {
          type: 'formula',
          label: 'Rủi ro inventory từ covariance',
          content: math`$$\operatorname{Var}(X_t^\top R_{t+\Delta t}\mid\mathcal F_t)\approx X_t^\top\Sigma X_t\,\Delta t$$`,
          note:
            'Vì vậy Q thường được hiệu chỉnh theo covariance Σ và mức ác cảm rủi ro λ, chẳng hạn Q=λΣ trong một đặc tả đơn giản.',
        },
        {
          type: 'paragraph',
          content:
            'Liên hệ kinh tế là trực tiếp: covariance lớn theo hướng inventory hiện tại làm phân phối P&L rộng hơn, nên chiến lược tối ưu có động lực giảm vị thế nhanh hơn. Common volatility làm nhiều thành phần inventory cùng chịu một cú sốc; idiosyncratic volatility phản ánh phần rủi ro riêng. Tuy nhiên tham số khuếch tán đi vào dynamics và covariance trạng thái, còn $R,Q,A$ đi vào sở thích hoặc chi phí. Không nên đồng nhất hai nhóm tham số.',
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Q không tự động bằng covariance',
          content:
            'Đặt $Q=\\lambda\\Sigma$ là một lựa chọn mô hình có ý nghĩa, nhưng cần nêu rõ λ, horizon và đơn vị. Nếu X là số cổ phiếu còn Σ là covariance return, có thể cần thêm mức giá hoặc quy đổi sang dollar inventory để hạng chi phí có đơn vị nhất quán.',
        },
      ],
    },
    {
      heading: '14. Pipeline Python có thể tái lập',
      eyebrow: 'Thực hành dữ liệu',
      summary:
        'Một pipeline tốt phải khóa tần suất, lịch giao dịch, cách xử lý thiếu dữ liệu và mọi phép annualization.',
      blocks: [
        {
          type: 'steps',
          title: 'Trình tự nên giữ cố định',
          items: [
            'Đọc Adjusted Close và kiểm tra giá dương, ngày trùng, mã trùng.',
            'Khóa universe VN30 theo quy tắc nghiên cứu và ghi rõ có hay không xử lý thay đổi thành phần.',
            'Tính log-return rồi mới căn chỉnh các chuỗi theo ngày chung.',
            'Tính mean, variance, covariance ở tần suất gốc.',
            'Ước lượng factor model và lưu residual diagnostics.',
            'Năm hóa đúng tầng: mean ×252, variance ×252, standard deviation ×√252.',
            'Xuất cả tham số, số quan sát, khoảng thời gian và giả định.',
          ],
        },
        {
          type: 'code',
          label: 'Python · pipeline tối thiểu hoàn chỉnh',
          note: 'prices gồm 30 mã; vn30_price là Series chỉ số',
          content: code`import numpy as np
import pandas as pd
import statsmodels.api as sm

K = 252

# 1) Chuẩn hóa dữ liệu giá
prices = prices.sort_index()
vn30_price = vn30_price.sort_index().rename("VN30")
prices = prices[~prices.index.duplicated(keep="last")]
vn30_price = vn30_price[~vn30_price.index.duplicated(keep="last")]

# 2) Log-return
stock_r = np.log(prices).diff()
market_r = np.log(vn30_price).diff()
data = stock_r.join(market_r, how="inner").dropna()

stock_r = data[prices.columns]
market_r = data["VN30"]

# 3) Thống kê mẫu
summary = pd.DataFrame({
    "mean_daily": stock_r.mean(),
    "var_daily": stock_r.var(ddof=1),
    "vol_daily": stock_r.std(ddof=1),
})
summary["mean_log_annual"] = K * summary["mean_daily"]
summary["var_annual"] = K * summary["var_daily"]
summary["vol_annual"] = np.sqrt(K) * summary["vol_daily"]

# 4) Nhân tố VN30
sigma_0 = market_r.std(ddof=1) * np.sqrt(K)
for ticker in stock_r:
    fit = sm.OLS(stock_r[ticker], sm.add_constant(market_r)).fit()
    beta = fit.params["VN30"]
    summary.loc[ticker, "alpha_daily"] = fit.params["const"]
    summary.loc[ticker, "beta"] = beta
    summary.loc[ticker, "r_squared"] = fit.rsquared
    summary.loc[ticker, "sigma_common"] = abs(beta) * sigma_0
    summary.loc[ticker, "sigma_id"] = np.sqrt(fit.mse_resid * K)

# 5) Kiểm tra phân rã
summary["var_factor_model"] = (
    summary["sigma_common"]**2 + summary["sigma_id"]**2
)
summary["mu_price_annual"] = (
    summary["mean_log_annual"] + 0.5 * summary["vol_annual"]**2
)

summary.to_csv("vn30_quant_parameters.csv", encoding="utf-8-sig")`,
        },
        {
          type: 'comparison',
          columns: ['Công thức', 'Hàm', 'Lưu ý'],
          rows: [
            ['$\\ln(S_t/S_{t-1})$', '`np.log(prices).diff()`', 'Không dùng log của hiệu giá'],
            ['$\\bar R$', '`.mean()`', 'Mean theo cột'],
            ['$s^2$', '`.var(ddof=1)`', 'Mẫu số n−1'],
            ['$s$', '`.std(ddof=1)`', 'Cùng đơn vị với return'],
            ['$\\Sigma$', '`.cov(ddof=1)`', 'Căn chỉnh missing data trước'],
            ['OLS', '`sm.OLS(y, sm.add_constant(x)).fit()`', 'statsmodels không tự thêm intercept'],
          ],
        },
      ],
    },
    {
      heading: '15. Chẩn đoán mô hình và các bẫy thực nghiệm',
      eyebrow: 'Độ tin cậy',
      summary:
        'Kết quả số chỉ có ý nghĩa khi dữ liệu và giả định tạo ra nó được kiểm tra.',
      blocks: [
        {
          type: 'comparison',
          columns: ['Bẫy', 'Hệ quả', 'Cách xử lý'],
          rows: [
            ['Dùng Close chưa hiệu chỉnh', 'Corporate action thành return giả', 'Dùng chuỗi total-return/adjusted phù hợp'],
            ['Danh sách VN30 cố định hiện tại', 'Survivorship bias', 'Dùng membership lịch sử hoặc công bố giới hạn'],
            ['Ghép pairwise không nhất quán', 'Covariance matrix có thể không PSD', 'Ưu tiên một panel ngày chung'],
            ['Forward-fill giá thiếu', 'Volatility bị kéo thấp', 'Điều tra missingness trước'],
            ['Nhân √252 vô điều kiện', 'Sai khi có autocorrelation/chế độ', 'Kiểm tra ACF và rolling volatility'],
            ['Đồng nhất sigma0 với common của mọi mã', 'Bỏ qua beta', 'Dùng $|\\beta_i|\\sigma_0$'],
            ['Một sigmaID cho 30 mã', 'Che khuất dị biệt doanh nghiệp', 'Báo cáo từng mã trước khi gộp'],
          ],
        },
        {
          type: 'paragraph',
          content:
            'Một mô hình nhân tố tối thiểu nên xem đồ thị residual, autocorrelation, heteroskedasticity và rolling estimates. $R^2$ thấp không tự động làm mô hình vô dụng: nó cho biết VN30 chỉ giải thích ít variance của mã đó. Ngược lại, $R^2$ cao không chứng minh quan hệ nhân quả; nó chỉ mô tả mức đồng biến động tuyến tính trong mẫu.',
        },
        {
          type: 'code',
          label: 'Python · kiểm tra nhanh một hồi quy',
          content: code`from statsmodels.stats.diagnostic import (
    acorr_ljungbox,
    het_arch,
)

resid = fit.resid
ljung_box = acorr_ljungbox(resid, lags=[5, 10], return_df=True)
arch_lm = het_arch(resid, nlags=5)

rolling_vol_20 = stock_r[ticker].rolling(20).std() * np.sqrt(252)
rolling_beta_60 = (
    stock_r[ticker].rolling(60).cov(market_r)
    / market_r.rolling(60).var()
)`,
        },
        {
          type: 'insight',
          tone: 'rose',
          title: 'Volatility không phải toàn bộ rủi ro',
          content:
            'Standard deviation đối xử cú tăng và cú giảm đối xứng, nhạy với outlier và không mô tả đầy đủ tail risk, thanh khoản hay market impact. Trong bài toán giao dịch tối ưu, cần đặt volatility cạnh drawdown, expected shortfall, spread, depth và chi phí thực thi.',
        },
      ],
    },
    {
      heading: '16. Tài liệu tham khảo và quy ước báo cáo',
      eyebrow: 'Nguồn và tái lập',
      summary:
        'Các nguồn dưới đây được chọn để người đọc có thể kiểm tra cả định nghĩa thống kê, API code và cơ sở thực nghiệm tài chính.',
      blocks: [
        {
          type: 'steps',
          title: 'Checklist khi công bố tham số VN30',
          items: [
            'Khoảng thời gian, tần suất và số quan sát thực tế.',
            'Nguồn giá, trường giá và cách điều chỉnh corporate actions.',
            'Quy tắc thành viên VN30 và cách xử lý mã vào/ra chỉ số.',
            'Định nghĩa return: simple hay log-return.',
            'Mẫu số variance và residual degrees of freedom.',
            'Quy tắc annualization cùng giả định đi kèm.',
            'Định nghĩa chính xác của $\\sigma_0$, $\\sigma_{common,i}$ và $\\sigma_{ID,i}$.',
          ],
        },
        {
          type: 'source-list',
          title: 'Nguồn nền tảng và tài liệu kỹ thuật',
          items: [
            {
              title: 'NIST/SEMATECH · Measures of Scale',
              note: 'Định nghĩa sample variance, standard deviation và vai trò của mẫu số n−1.',
              href: 'https://itl.nist.gov/div898/handbook/eda/section3/eda356.htm',
            },
            {
              title: 'NIST/SEMATECH · Mean Vector and Covariance Matrix',
              note: 'Định nghĩa mean vector, sample covariance và covariance matrix.',
              href: 'https://www.itl.nist.gov/div898/handbook/pmc/section5/pmc541.htm',
            },
            {
              title: 'NumPy · numpy.log',
              note: 'Tài liệu chính thức cho log tự nhiên theo từng phần tử.',
              href: 'https://numpy.org/doc/stable/reference/generated/numpy.log.html',
            },
            {
              title: 'pandas · DataFrame.var',
              note: 'Xác nhận ddof=1 và mẫu số N−1 là mặc định.',
              href: 'https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.var.html',
            },
            {
              title: 'pandas · DataFrame.cov',
              note: 'Covariance theo cột và cảnh báo về missing data/positive semidefiniteness.',
              href: 'https://pandas.pydata.org/pandas-docs/version/2.2/reference/api/pandas.DataFrame.cov.html',
            },
            {
              title: 'statsmodels · Ordinary Least Squares',
              note: 'API OLS và lưu ý intercept không được thêm tự động.',
              href: 'https://www.statsmodels.org/dev/generated/statsmodels.regression.linear_model.OLS.html',
            },
            {
              title: 'NumPy · Cholesky decomposition',
              note: 'Định nghĩa LLᵀ và yêu cầu đầu vào đối xứng xác định dương.',
              href: 'https://numpy.org/doc/2.0/reference/generated/numpy.linalg.cholesky.html',
            },
            {
              title: 'NumPy · Linear algebra reference',
              note: 'Các hàm eigvalsh, eigh, cond, matrix_rank và decompositions dùng để kiểm tra hình học ma trận.',
              href: 'https://numpy.org/doc/stable/reference/routines.linalg.html',
            },
            {
              title: 'MIT OpenCourseWare · Stochastic Processes II',
              note: 'Brownian motion, Gaussian increments, independent increments và variance tỷ lệ với thời gian.',
              href: 'https://ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013/3b97c6b0c282dd9dc024c4c7ffe3fba8_MIT18_S096F13_lecnote17.pdf',
            },
            {
              title: 'Campbell, Lettau, Malkiel & Xu · Idiosyncratic Risk',
              note: 'Nghiên cứu thực nghiệm phân rã volatility ở cấp thị trường, ngành và doanh nghiệp.',
              href: 'https://www.nber.org/papers/w7590',
            },
            {
              title: 'Herskovic, Kelly, Lustig & Van Nieuwerburgh · Common Factor in Idiosyncratic Volatility',
              note: 'Bằng chứng rằng idiosyncratic volatility cũng có cấu trúc nhân tố chung.',
              href: 'https://www.nber.org/papers/w20076',
            },
            {
              title: 'CFA Institute · Annualizing Standard Deviation',
              note: 'Thảo luận giới hạn của quy tắc căn thời gian và lợi thế của log-return khi cộng theo kỳ.',
              href: 'https://rpc.cfainstitute.org/research/cfa-digest/2013/11/whats-wrong-with-multiplying-by-the-square-root-of-twelve-digest-summary',
            },
          ],
        },
        {
          type: 'paragraph',
          content:
            'Kết luận cốt lõi: thống kê không “biến thành” một công thức tài chính khác; tài chính chọn biến quan sát là return, chọn horizon và gắn ý nghĩa kinh tế cho cùng các toán tử mean, variance và covariance. Mọi bước hiệu chỉnh phải bảo toàn ba thứ: đối tượng đang đo, mẫu số đang dùng và đơn vị thời gian.',
        },
      ],
    },
  ],
};
