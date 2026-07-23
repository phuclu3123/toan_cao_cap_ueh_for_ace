const math = String.raw;
const code = String.raw;

export const quantFinanceStatisticsPost = {
  slug: 'thong-ke-den-quant-finance-vn30',
  title: 'Từ thống kê mẫu đến Quant Finance: đo lợi suất và rủi ro trên VN30',
  category: 'Chuyên khảo · Quant Finance',
  date: '23/07/2026',
  updatedAt: 'Đã đối chiếu nguồn ngày 23/07/2026',
  author: 'Lữ Võ Hoàng Phúc (K50 UEH)',
  readingTime: '32 phút đọc · kèm công thức và Python',
  level: 'Nền tảng thống kê → mô hình nhân tố',
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
    'Một bản đồ ký hiệu có hệ thống từ mean, sample variance và covariance đến log-return, volatility năm hóa, beta thị trường, common noise và idiosyncratic risk. Mỗi khái niệm được trình bày theo ba lớp: thống kê, tài chính và Python.',
  scope: {
    label: 'Mục tiêu của bài',
    title: 'Không học thuộc công thức tài chính tách rời thống kê',
    description:
      'Bài viết xuất phát từ mẫu quan sát, giữ nguyên mẫu số và đơn vị đo, rồi mới chuyển từng đại lượng sang ngôn ngữ lợi suất và rủi ro của VN30.',
  },
  highlights: [
    { value: '03', label: 'tầng đọc: thống kê · tài chính · code' },
    { value: '02', label: 'loại rủi ro: chung · đặc thù' },
    { value: '01', label: 'pipeline có thể tái lập' },
  ],
  toc: [
    'Dẫn nhập: s² có phải var không?',
    '1. Bản đồ ký hiệu: tổng thể, mẫu và ước lượng',
    '2. Từ giá hiệu chỉnh đến log-return',
    '3. Mean của return và drift của mô hình giá',
    '4. Variance, standard deviation và volatility',
    '5. Covariance, correlation và ma trận rủi ro',
    '6. Từ VN30 đến common và idiosyncratic volatility',
    '7. Hai cách hiệu chỉnh sigma₀ và sigmaID',
    '8. Từ rủi ro thống kê đến hàm mục tiêu LQ',
    '9. Pipeline Python có thể tái lập',
    '10. Chẩn đoán mô hình và các bẫy thực nghiệm',
    '11. Tài liệu tham khảo và quy ước báo cáo',
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
      heading: '6. Từ VN30 đến common và idiosyncratic volatility',
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
      heading: '7. Hai cách hiệu chỉnh sigma₀ và sigmaID',
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
      heading: '8. Từ rủi ro thống kê đến hàm mục tiêu LQ',
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
      heading: '9. Pipeline Python có thể tái lập',
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
      heading: '10. Chẩn đoán mô hình và các bẫy thực nghiệm',
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
      heading: '11. Tài liệu tham khảo và quy ước báo cáo',
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
