const math = String.raw;
const code = String.raw;

export const deepBsdeMfgMfcPost = {
  slug: 'deep-bsde-fbsde-mfg-mfc-quant-finance',
  title: 'Deep BSDE, FBSDE và Mean Field: nền tảng xây dựng mô hình Quant Finance số chiều cao',
  category: 'Chuyên khảo · Stochastic Control',
  date: '23/07/2026',
  updatedAt: 'Cập nhật chuyên sâu và đối chiếu nguồn ngày 24/07/2026',
  author: 'Lữ Võ Hoàng Phúc (K50 UEH)',
  readingTime: '120 phút đọc · từ ký hiệu đến mô hình và kiểm chứng',
  level: 'Xác suất nền tảng → Deep BSDE nâng cao',
  keywords: [
    'Deep BSDE',
    'FBSDE',
    'MFG',
    'MFC',
    'Itô calculus',
    'Brownian motion',
    'Almgren–Chriss',
    'LQ control',
    'Price of Anarchy',
    'Neural network',
    'Full law',
    'L2 norm',
    'Lions derivative',
    'Pontryagin principle',
  ],
  image: '/images/deep-bsde-cover.svg',
  excerpt:
    'Một chuyên khảo có hệ thống về cách Brownian motion, công thức Itô, stochastic maximum principle, FBSDE, LQ/Riccati, Almgren–Chriss, MFG/MFC và mạng neural kết nối thành phương pháp Deep BSDE cho các bài toán điều khiển tài chính số chiều cao.',
  scope: {
    label: 'Phạm vi chuyên khảo',
    title: 'Từ nền tảng xác suất đến một pipeline Deep BSDE có thể kiểm chứng',
    description:
      'Bài viết tập trung vào cấu trúc toán, ý nghĩa kinh tế, kiến trúc thuật toán và kỷ luật đánh giá. Đây là tài liệu nền tảng độc lập, không phải mô tả một dự án, sản phẩm đầu tư hay khuyến nghị giao dịch.',
  },
  highlights: [
    { value: '28', label: 'section từ nhập môn đến triển khai' },
    { value: '07', label: 'sơ đồ kiến trúc kỹ thuật' },
    { value: '05', label: 'tầng benchmark bắt buộc' },
  ],
  toc: [
    'Dẫn nhập: Deep BSDE đang giải bài toán gì?',
    '1. Bản đồ khái niệm: từ xác suất đến chính sách điều khiển',
    '2. Không gian xác suất, filtration và tính adapted',
    '3. Brownian motion và vì sao nhiễu có căn bậc hai thời gian',
    '4. Công thức Itô: chain rule của thế giới ngẫu nhiên',
    '5. SDE, BSDE và ý nghĩa của biến martingale Z',
    '6. FBSDE: vì sao phương trình tiến và lùi phải giải đồng thời?',
    '7. Nguyên lý Pontryagin, stochastic maximum principle và Hamiltonian',
    '8. Linear–Quadratic control và phương trình Riccati',
    '9. Almgren–Chriss: benchmark kinh điển của optimal execution',
    '9A. Almgren–Chriss trong pipeline: diagonal impact, full-covariance risk',
    '10. Từ nhiều agent đến McKean–Vlasov và empirical law',
    '11. Mean Field Game: cân bằng của các agent chiến lược',
    '12. Mean Field Control: social planner tối ưu toàn quần thể',
    '13. MFG, MFC và Price of Anarchy',
    '14. Vì sao dùng Deep BSDE thay vì lưới PDE?',
    '15. ANN trong Deep BSDE học đối tượng nào?',
    '16. Thuật toán rời rạc hóa, rollout và hàm loss',
    '17. Xây dựng mô hình execution nhiều tài sản có mean field',
    '18. Benchmark, chẩn đoán và kỷ luật triển khai',
    '19. Từ điển ký hiệu: đọc công thức mà không bị ngợp',
    '20. Chuẩn, không gian L² và hình học sai số',
    '21. Full Law: từ phân phối xác suất đến Deep Sets',
    '21A. Full Law trong pipeline: moment closure và empirical-law diagnostic',
    '22. Giải phẫu mô hình mẹ: từ kinh tế đến một bước code',
    '23. Thiết kế benchmark như scientific unit test',
    '24. Những cầu nối nâng cao và giới hạn mô hình',
    '25. Tài liệu tham khảo cốt lõi',
  ],
  sections: [
    {
      heading: 'Dẫn nhập: Deep BSDE đang giải bài toán gì?',
      eyebrow: 'Định vị vấn đề',
      summary:
        'Deep BSDE không phải một mô hình dự báo giá. Nó là một họ phương pháp số dùng neural network để xấp xỉ nghiệm của BSDE/FBSDE hoặc PDE liên quan trong không gian số chiều cao.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Nhiều bài toán Quant Finance có cùng một cấu trúc: trạng thái thị trường hoặc danh mục tiến hóa ngẫu nhiên theo thời gian; quyết định hiện tại ảnh hưởng cả chi phí tức thời lẫn phân phối kết quả tương lai; và điều kiện cuối kỳ lại áp đặt một ràng buộc hoặc payoff phải được thỏa mãn. Pricing phái sinh, quản trị rủi ro, allocation động và optimal execution đều có thể dẫn đến PDE, stochastic control hoặc hệ forward–backward stochastic differential equations.',
        },
        {
          type: 'formula',
          label: 'Ba lớp của một bài toán điều khiển ngẫu nhiên',
          content: math`$$\begin{aligned}
&\underbrace{\mathrm dX_t=b(t,X_t,\alpha_t,\mu_t)\,\mathrm dt+\sigma(t,X_t,\mu_t)\,\mathrm dW_t}_{\text{state dynamics}} \\[1.2em]
{}+{} &\underbrace{J(\alpha)=\mathbb E\!\left[\int_0^T f(t,X_t,\alpha_t,\mu_t)\,\mathrm dt+g(X_T,\mu_T)\right]}_{\text{objective}} \\[1.2em]
{}+{} &\underbrace{\alpha_t\in\mathcal A}_{\text{admissible policy}}
\end{aligned}$$`,
          note:
            'X là state, α là control, μ là phân phối quần thể hoặc law feature, còn W là nguồn ngẫu nhiên Brownian.',
        },
        {
          type: 'diagram',
          kind: 'theory-stack',
          title: 'Bốn tầng kiến thức hợp thành Deep BSDE',
          caption:
            'Xác suất tạo ngôn ngữ cho nhiễu; stochastic control tạo điều kiện tối ưu; mean field mô tả tương tác quần thể; deep learning cung cấp bộ xấp xỉ số chiều cao.',
        },
        {
          type: 'insight',
          tone: 'teal',
          title: 'Deep BSDE không thay thế lý thuyết',
          content:
            'Neural network chỉ xấp xỉ các hàm hoặc quá trình chưa biết. Dynamics, terminal condition, Hamiltonian, dấu của control, điều kiện lồi và objective vẫn phải được thiết lập đúng trước khi huấn luyện. Một solver tối ưu tốt cho mô hình sai vẫn cho một kết quả sai rất thuyết phục.',
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Quy ước đọc: implementation là trục chính',
          content:
            'Mỗi chủ đề được tách thành “dạng dùng trong pipeline” và “mở rộng lý thuyết để hiểu bối cảnh”. Công thức triển khai, evaluator và benchmark quyết định claim chính; tài liệu học thuật dùng để giải thích vì sao cấu trúc đó hợp lý hoặc còn giới hạn ở đâu, không tự động biến một mở rộng tổng quát thành thành phần đã được cài đặt.',
        },
        {
          type: 'paragraph',
          content:
            'Điểm hấp dẫn của Deep BSDE là thay một lưới không gian tăng theo cấp số nhân bằng một bài toán tối ưu tham số trên các quỹ đạo Monte Carlo. Đổi lại, ta nhận một bài toán huấn luyện phi lồi, có sampling error và cần benchmark nghiêm ngặt. Vì thế giá trị của phương pháp không nằm ở chữ “deep”, mà ở khả năng kết hợp cấu trúc toán với một protocol kiểm chứng có tầng bậc.',
        },
      ],
    },
    {
      heading: '1. Bản đồ khái niệm: từ xác suất đến chính sách điều khiển',
      eyebrow: 'Bản đồ đọc',
      summary:
        'Các thuật ngữ SDE, BSDE, FBSDE, HJB, MFG và Deep BSDE không phải những mảnh rời; chúng là các biểu diễn khác nhau của cùng một lớp bài toán.',
      blocks: [
        {
          type: 'comparison',
          columns: ['Đối tượng', 'Câu hỏi trung tâm', 'Vai trò'],
          rows: [
            ['SDE', 'State thay đổi thế nào dưới drift và noise?', 'Mô tả động lực tiến'],
            ['BSDE', 'Giá trị hiện tại nào phù hợp terminal payoff tương lai?', 'Mô tả quá trình lùi'],
            ['FBSDE', 'State và adjoint/value coupling ra sao?', 'Điều kiện tối ưu xác suất'],
            ['HJB PDE', 'Value function thỏa phương trình động nào?', 'Biểu diễn dynamic programming'],
            ['Riccati ODE', 'HJB/FBSDE LQ rút gọn thành gì?', 'Benchmark giải tích hoặc bán giải tích'],
            ['MFG', 'Một agent tối ưu trước law rồi law có tự nhất quán?', 'Nash equilibrium quần thể'],
            ['MFC', 'Một planner chọn policy tốt nhất cho toàn law?', 'Social optimum'],
            ['Deep BSDE', 'Xấp xỉ initial value và martingale terms thế nào?', 'Solver dựa trên simulation và SGD'],
          ],
        },
        {
          type: 'formula',
          label: 'Hai con đường phổ biến',
          content: math`$$\begin{aligned}
\text{Stochastic control}
\longrightarrow
\begin{cases}
\text{Dynamic programming}\longrightarrow\text{HJB PDE},\\
\text{Maximum principle}\longrightarrow\text{FBSDE}.
\end{cases}
\end{aligned}$$`,
          note:
            'Hai biểu diễn có thể tương đương khi nghiệm đủ trơn và các giả định phù hợp, nhưng dẫn đến phương pháp số khác nhau.',
        },
        {
          type: 'paragraph',
          content:
            'Dynamic programming tập trung vào value function trên không gian trạng thái. Maximum principle tập trung vào state trajectory và adjoint trajectory. Trong số chiều thấp, PDE grid có thể rất mạnh và minh bạch. Trong số chiều cao, FBSDE dựa trên Monte Carlo hấp dẫn vì chi phí lấy mẫu thường tăng nhẹ hơn so với việc phủ kín toàn bộ state space.',
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Một từ có thể mang nhiều nghĩa',
          content:
            '$Y_t$ trong BSDE có thể là value process; $p_t$ trong maximum principle là adjoint. Trong bài toán Markov trơn, chúng liên hệ với value function và gradient của value function, nhưng không nên đổi ký hiệu tùy ý. Tương tự, $Z_t$ hoặc $q_t$ là martingale loading, không phải noise được thêm tùy tiện.',
        },
      ],
    },
    {
      heading: '2. Không gian xác suất, filtration và tính adapted',
      eyebrow: 'Nền tảng xác suất',
      summary:
        'Một control hợp lệ chỉ được dùng thông tin đã xuất hiện; filtration là cơ chế toán học ngăn mô hình nhìn trước tương lai.',
      blocks: [
        {
          type: 'formula',
          label: 'Filtered probability space',
          content: math`$$\left(\Omega,\mathcal F,(\mathcal F_t)_{0\leq t\leq T},\mathbb P\right)$$`,
          note:
            'Ω là tập kịch bản; F là sigma-algebra; P là probability measure; Ft là thông tin tích lũy đến thời điểm t.',
        },
        {
          type: 'comparison',
          columns: ['Ký hiệu', 'Cách hiểu thực hành'],
          rows: [
            ['$\\omega\\in\\Omega$', 'Một kịch bản hoàn chỉnh của mọi nguồn ngẫu nhiên'],
            ['$\\mathcal F$', 'Tập các sự kiện có thể gán xác suất'],
            ['$\\mathcal F_t$', 'Thông tin quan sát được đến thời điểm t'],
            ['$\\mathbb P$', 'Quy luật gán xác suất cho các kịch bản'],
            ['$\\mathbb E[X\\mid\\mathcal F_t]$', 'Dự báo của X khi chỉ dùng thông tin đến t'],
            ['Adapted process', '$X_t$ không phụ thuộc thông tin sau t'],
            ['Progressively measurable control', 'Policy có thể thực thi theo thời gian, không nhìn trước noise'],
          ],
        },
        {
          type: 'formula',
          label: 'Điều kiện không nhìn trước',
          content: math`$$\alpha_t\ \text{is }\mathcal F_t\text{-measurable for all }t$$`,
          note:
            'Nếu αt dùng ΔWt của cùng bước trước khi increment được sinh, simulation đã tạo look-ahead bias.',
        },
        {
          type: 'paragraph',
          content:
            'Trong code, thứ tự thao tác là một phần của toán học: network nhận state và law feature tại $t_k$, tạo control hoặc martingale loading tại $t_k$, sau đó mới lấy $\\Delta W_k$ để cập nhật sang $t_{k+1}$. Nếu dùng state đã chứa $\\Delta W_k$ để quyết định control “tại $t_k$”, policy không còn adapted.',
        },
        {
          type: 'insight',
          tone: 'rose',
          title: 'Random seed không sửa được information leakage',
          content:
            'Seed giúp tái lập cùng một chuỗi ngẫu nhiên. Nó không hợp thức hóa việc dùng future increment, future mean flow hoặc terminal state làm input cho policy hiện tại.',
        },
      ],
    },
    {
      heading: '3. Brownian motion và vì sao nhiễu có căn bậc hai thời gian',
      eyebrow: 'Wiener process',
      summary:
        'Brownian motion là giới hạn liên tục của random walk với increments Gaussian độc lập và variance tỷ lệ tuyến tính với độ dài thời gian.',
      blocks: [
        {
          type: 'formula',
          label: 'Các tính chất cốt lõi',
          content: math`$$W_0=0,\qquad W_t-W_s\sim\mathcal N(0,(t-s)I_d),\qquad 0\leq s<t$$`,
          note:
            'Increments trên các khoảng không giao nhau độc lập; quỹ đạo liên tục gần như chắc chắn nhưng không khả vi.',
        },
        {
          type: 'formula',
          label: 'Brownian increment trên lưới',
          content: math`$$\Delta W_k=W_{t_{k+1}}-W_{t_k}=\sqrt{\Delta t}\,\xi_k,\qquad \xi_k\overset{\mathrm{iid}}{\sim}\mathcal N(0,I_d)$$`,
          note:
            'Nhân √Δt vì Var(ΔWk)=Δt·Id. Nhân Δt sẽ làm variance sai bậc.',
        },
        {
          type: 'formula',
          label: 'Nhiễu tương quan nhiều tài sản',
          content: math`$$LL^\top=\Sigma,\qquad L\Delta W_k\sim\mathcal N(0,\Sigma\Delta t)$$`,
          note:
            'Cholesky factor L đưa geometry covariance vào các cú sốc Monte Carlo.',
        },
        {
          type: 'code',
          label: 'Python · sinh Brownian increments tương quan',
          content: code`rng = np.random.default_rng(seed)
dt = T / n_steps
L = np.linalg.cholesky(covariance)

z = rng.standard_normal((n_paths, n_steps, d))
dW_independent = np.sqrt(dt) * z
dW_correlated = dW_independent @ L.T

# Covariance xấp xỉ covariance * dt
check = np.cov(dW_correlated[:, 0, :], rowvar=False)`,
        },
        {
          type: 'paragraph',
          content:
            'Brownian motion không nói mọi return thực tế đều Gaussian. Nó là một building block liên tục giúp biểu diễn innovation nhỏ và tạo stochastic calculus. Volatility clustering, jumps, heavy tails hoặc microstructure effects có thể đòi hỏi diffusion trạng thái, jump process, stochastic volatility hay mô hình phi Gaussian phong phú hơn.',
        },
      ],
    },
    {
      heading: '4. Công thức Itô: chain rule của thế giới ngẫu nhiên',
      eyebrow: 'Stochastic calculus',
      summary:
        'Do Brownian increment có quadratic variation khác 0, chain rule phải có thêm hạng Hessian bậc hai.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Trong calculus thông thường, $(\\mathrm dt)^2$ bị bỏ qua. Với Brownian motion, quy tắc bậc vi phân là $(\\mathrm dW_t)^2=\\mathrm dt$, còn $\\mathrm dt\\,\\mathrm dW_t=0$ và $(\\mathrm dt)^2=0$. Đây là nguồn gốc của Itô correction.',
        },
        {
          type: 'formula',
          label: 'Itô formula một chiều',
          content: math`$$\mathrm dX_t=b_t\,\mathrm dt+\sigma_t\,\mathrm dW_t
\quad\Longrightarrow\quad
\mathrm df(t,X_t)=
\left(f_t+b_tf_x+\frac12\sigma_t^2f_{xx}\right)\mathrm dt
+\sigma_tf_x\,\mathrm dW_t$$`,
          note:
            'Hạng ½σ²fxx không xuất hiện trong chain rule tất định.',
        },
        {
          type: 'formula',
          label: 'Itô formula nhiều chiều',
          content: math`$$\mathrm df(t,X_t)=
\left[
\partial_tf+\nabla f^\top b
+\frac12\operatorname{Tr}\!\left(\sigma\sigma^\top\nabla_x^2f\right)
\right]\mathrm dt
+\nabla f^\top\sigma\,\mathrm dW_t$$`,
          note:
            'Trace term gom tác động của covariance tức thời lên độ cong của f.',
        },
        {
          type: 'example',
          open: true,
          meta: 'Ví dụ nền tảng · log của GBM',
          title: 'Vì sao log-price drift bị trừ một nửa variance?',
          prompt:
            'Cho $\\mathrm dS_t/S_t=\\mu\\,\\mathrm dt+\\sigma\\,\\mathrm dW_t$. Dùng Itô cho $f(S)=\\ln S$.',
          method:
            'Dùng $f\'(S)=1/S$ và $f\'\'(S)=-1/S^2$ trong Itô formula.',
          steps: [
            { label: 'Đạo hàm', content: '$f_S=1/S$ và $f_{SS}=-1/S^2$.' },
            { label: 'Thế dynamics', content: '$\\mathrm dS=\\mu S\\,\\mathrm dt+\\sigma S\\,\\mathrm dW$ và $(\\mathrm dS)^2=\\sigma^2S^2\\,\\mathrm dt$.' },
            { label: 'Rút gọn', content: '$\\mathrm d\\ln S=(\\mu-\\frac12\\sigma^2)\\mathrm dt+\\sigma\\mathrm dW$.' },
          ],
          result: '$\\boxed{\\mathrm d\\ln S_t=(\\mu-\\frac12\\sigma^2)\\mathrm dt+\\sigma\\mathrm dW_t}$',
          interpretation:
            'Độ cong của log làm drift log-price thấp hơn drift arithmetic return một nửa instantaneous variance.',
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Itô là cầu nối giữa SDE và PDE/BSDE',
          content:
            'Áp dụng Itô cho value function $V(t,X_t)$ rồi so khớp drift và martingale terms tạo ra HJB equation hoặc BSDE representation. Vì thế Itô không phải phần phụ; nó là bước biến một bài toán tối ưu động thành hệ phương trình có thể giải.',
        },
      ],
    },
    {
      heading: '5. SDE, BSDE và ý nghĩa của biến martingale Z',
      eyebrow: 'Forward và backward',
      summary:
        'SDE đi từ điều kiện đầu; BSDE đi từ điều kiện cuối. Biến Z bảo đảm quá trình backward phản ứng đúng với thông tin ngẫu nhiên mới.',
      blocks: [
        {
          type: 'formula',
          label: 'Forward SDE',
          content: math`$$\mathrm dX_t=b(t,X_t)\,\mathrm dt+\sigma(t,X_t)\,\mathrm dW_t,\qquad X_0=x_0$$`,
          note:
            'Biết X0 và noise path, ta mô phỏng tiến để có X1,…,XT.',
        },
        {
          type: 'formula',
          label: 'Backward SDE',
          content: math`$$\mathrm dY_t=-f(t,X_t,Y_t,Z_t)\,\mathrm dt+Z_t\,\mathrm dW_t,\qquad Y_T=g(X_T)$$`,
          note:
            'Terminal condition YT được cho; Y0 và toàn bộ Zt chưa biết.',
        },
        {
          type: 'formula',
          label: 'Dạng tích phân của BSDE',
          content: math`$$Y_t=g(X_T)+\int_t^T f(s,X_s,Y_s,Z_s)\,\mathrm ds-\int_t^T Z_s\,\mathrm dW_s$$`,
          note:
            'Stochastic integral có conditional expectation bằng 0 dưới điều kiện tích phân phù hợp.',
        },
        {
          type: 'comparison',
          columns: ['Biến', 'Ý nghĩa toán học', 'Trực giác'],
          rows: [
            ['$Y_t$', 'Backward value process', 'Giá trị/chi phí kỳ vọng còn lại tại t'],
            ['$Z_t$', 'Martingale integrand', 'Độ nhạy của Y với innovation dWt'],
            ['$f$', 'BSDE driver', 'Tốc độ tích lũy chi phí hoặc phi tuyến'],
            ['$g(X_T)$', 'Terminal condition', 'Payoff hoặc terminal penalty'],
          ],
        },
        {
          type: 'paragraph',
          content:
            'Trong thiết lập Markov đủ trơn, nếu $Y_t=u(t,X_t)$ thì Itô cho biết $Z_t=\\nabla_xu(t,X_t)^\top\\sigma(t,X_t)$. Do đó network học $Z$ đang học một đại lượng gradient-like theo đường đi, không chỉ fit một chuỗi số ngẫu nhiên.',
        },
        {
          type: 'insight',
          tone: 'rose',
          title: 'Đặt Z=0 có thể phá BSDE',
          content:
            'Nếu terminal payoff phụ thuộc noise, backward process phải điều chỉnh khi thông tin mới đến. Tắt Z trong một bài toán thực sự stochastic làm họ nghiệm quá nghèo; terminal loss có thể không giảm dù network cho Y0 rất linh hoạt.',
        },
      ],
    },
    {
      heading: '6. FBSDE: vì sao phương trình tiến và lùi phải giải đồng thời?',
      eyebrow: 'Coupled system',
      summary:
        'State cần control để đi tiến; control lại phụ thuộc adjoint hoặc value gradient đi lùi. Coupling này tạo bài toán boundary-value ngẫu nhiên.',
      blocks: [
        {
          type: 'formula',
          label: 'Một FBSDE tổng quát',
          content: math`$$\begin{aligned}
\mathrm dX_t&=b(t,X_t,Y_t,Z_t)\,\mathrm dt+\sigma(t,X_t,Y_t)\,\mathrm dW_t,\qquad X_0=x_0,\\
\mathrm dY_t&=-f(t,X_t,Y_t,Z_t)\,\mathrm dt+Z_t\,\mathrm dW_t,\qquad Y_T=g(X_T).
\end{aligned}$$`,
          note:
            'Điều kiện biên nằm ở hai đầu: X0 biết tại 0, YT biết tại T.',
        },
        {
          type: 'diagram',
          kind: 'fbsde-loop',
          title: 'Coupling tiến–lùi trong một hệ FBSDE',
          caption:
            'State đi từ X₀ đến Xₜ; terminal condition tạo adjoint/value đi ngược; control nối hai chiều thông qua Hamiltonian hoặc policy map.',
        },
        {
          type: 'paragraph',
          content:
            'Một initial-value solver thông thường không đủ vì ta không biết $Y_0$; một backward solver thuần túy cũng không đủ vì terminal condition phụ thuộc $X_T$, mà $X_T$ lại phụ thuộc control và backward variables. Classical methods thường lặp forward–backward hoặc shooting. Deep BSDE biến các unknown initial/martingale objects thành network parameters rồi tối ưu terminal mismatch.',
        },
        {
          type: 'comparison',
          columns: ['Coupling', 'Ví dụ'],
          rows: [
            ['Forward → backward', 'Terminal state XT quyết định terminal adjoint YT=g(XT)'],
            ['Backward → forward', 'Adjoint pt quyết định control αt, control quyết định drift của Xt'],
            ['Noise → backward', 'Zt hoặc qt phản ứng với dWt'],
            ['Population → cả hai', 'μt đi vào dynamics, running cost và adjoint driver'],
          ],
        },
        {
          type: 'insight',
          tone: 'teal',
          title: 'FBSDE không phải một kiến trúc neural',
          content:
            'FBSDE là đối tượng toán học. Deep BSDE chỉ là một chiến lược số để xấp xỉ nghiệm. Ta vẫn có thể giải FBSDE bằng continuation, regression Monte Carlo, branching, Picard iteration hoặc phương pháp PDE khi cấu trúc cho phép.',
        },
      ],
    },
    {
      heading: '7. Nguyên lý Pontryagin, stochastic maximum principle và Hamiltonian',
      eyebrow: 'Từ biến phân đến FBSDE',
      summary:
        'Pontryagin biến bài toán tối ưu cả quỹ đạo thành một hệ state–costate cùng điều kiện tối ưu Hamiltonian. Trong môi trường ngẫu nhiên, costate trở thành BSDE và chính cấu trúc này dẫn đến FBSDE.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Ý tưởng Pontryagin là hỏi: nếu thay control tối ưu trong một khoảng thời gian rất nhỏ, objective đổi ở bậc nhất như thế nào? Adjoint/costate $p_t$ được đưa vào để gom ảnh hưởng dây chuyền của biến thiên control lên toàn bộ state tương lai. Nhờ đó, thay vì so mọi quỹ đạo khả dĩ trực tiếp, ta kiểm một điều kiện Hamiltonian tại gần như mọi thời điểm.',
        },
        {
          type: 'formula',
          label: 'Pontryagin deterministic dạng minimization',
          content: math`$$
\begin{aligned}
&\textbf{1. State and Objective:} \\
&\quad \dot x_t = b(t,x_t,a_t), \qquad J(a) = g(x_T) + \int_0^T f(t,x_t,a_t)\,\mathrm dt \\[8pt]
&\textbf{2. Hamiltonian Function:} \\
&\quad H(t,x,p,a) = f(t,x,a) + p^\top b(t,x,a) \\[8pt]
&\textbf{3. Canonical System (Adjoint ODE):} \\
&\quad \dot x_t^\star = \nabla_p H(t,x_t^\star,p_t^\star,a_t^\star), \qquad \dot p_t^\star = -\nabla_x H(t,x_t^\star,p_t^\star,a_t^\star), \qquad p_T^\star = \nabla g(x_T^\star) \\[8pt]
&\textbf{4. Minimum Principle Condition:} \\
&\quad a_t^\star \in \arg\min_{a\in\mathcal A} H(t,x_t^\star,p_t^\star,a) \quad \text{a.e. } t.
\end{aligned}
$$`,
          note:
            'Ký hiệu đạo hàm: Dấu 1 chấm trên đầu (ví dụ $\\dot{x}_t = \\mathrm{d}x_t/\\mathrm{d}t$) là đạo hàm bậc nhất theo thời gian, tức tốc độ thay đổi của trạng thái $x_t$ hoặc shadow price $p_t$. Đây là Pontryagin Minimum Principle vì objective là cost cần tối thiểu.',
        },
        {
          type: 'comparison',
          columns: ['Thành phần Pontryagin', 'Vai trò toán học', 'Cách đọc kinh tế'],
          rows: [
            ['$x_t$', 'State đi tiến từ $x_0$', 'Inventory/wealth/risk exposure hiện tại'],
            ['$a_t$', 'Control có thể chọn', 'Tốc độ giao dịch hay quyết định phân bổ'],
            ['$p_t$', 'Costate/adjoint đi lùi từ terminal', 'Shadow cost của thêm một đơn vị state'],
            ['$H$', 'Running cost + state effect được định giá bởi p', 'Cost tức thời cộng hệ quả tương lai biên'],
            ['$p_T=\\nabla g(x_T)$', 'Transversality/terminal condition', 'Giá bóng của inventory cuối kỳ'],
            ['$\\arg\\min H$', 'Minimum condition', 'Mỗi control cân bằng liquidity cost và shadow inventory cost'],
          ],
        },
        {
          type: 'formula',
          label: 'Control bị ràng buộc: variational inequality',
          content: math`$$\left\langle
\nabla_aH(t,x_t^\star,p_t^\star,a_t^\star),
a-a_t^\star
\right\rangle\ge0
\qquad \forall a\in\mathcal A$$`,
          note:
            'FOC ∇ₐH=0 chỉ dành cho nghiệm nội điểm không ràng buộc. Ở biên sell-only/bounded-sell, gradient thường không bằng 0 nhưng không còn hướng khả thi nào làm cost giảm.',
        },
        {
          type: 'formula',
          label: 'Bài toán control',
          content: math`$$
\begin{aligned}
&\textbf{1. Objective Function:} \\
&\quad \inf_{\alpha\in\mathcal A} J(\alpha) = \mathbb E\!\left[\int_0^T \ell(t,X_t,\alpha_t)\,\mathrm dt + g(X_T)\right] \\[6pt]
&\textbf{2. Stochastic Dynamics:} \\
&\quad \mathrm dX_t = b(t,X_t,\alpha_t)\,\mathrm dt + \sigma(t,X_t,\alpha_t)\,\mathrm dW_t
\end{aligned}
$$`,
          note:
            'Giải thích ký hiệu: $X_t$ là quá trình trạng thái (state); $\\alpha_t$ là biến điều khiển (control policy); $\\ell$ là running cost (chi phí tức thời); $g(X_T)$ là terminal cost tại thời điểm $T$; $W_t$ là quá trình ngẫu nhiên Brownian motion.',
        },
        {
          type: 'formula',
          label: 'Hamiltonian ngẫu nhiên',
          content: math`$$H(t,x,\alpha,p,q)=\ell(t,x,\alpha)+p^\top b(t,x,\alpha)+\operatorname{Tr}\!\left(q^\top\sigma(t,x,\alpha)\right)$$`,
          note:
            'Nếu diffusion không phụ thuộc control, hạng q–σ có thể không ảnh hưởng FOC nhưng vẫn cần trong adjoint BSDE. Convention có thể khác giữa tài liệu; phải giữ nhất quán dấu.',
        },
        {
          type: 'formula',
          label: 'Adjoint BSDE và terminal condition',
          content: math`$$\mathrm dp_t=-\nabla_xH(t,X_t,\alpha_t,p_t,q_t)\,\mathrm dt+q_t\,\mathrm dW_t,
\qquad
p_T=\nabla_xg(X_T)$$`,
          note:
            'p là shadow value của state; q là martingale loading của adjoint.',
        },
        {
          type: 'formula',
          label: 'First-order condition nội điểm',
          content: math`$$\nabla_\alpha H(t,X_t,\alpha_t^\star,p_t,q_t)=0$$`,
          note:
            'Nếu control bị ràng buộc, dùng argmin trên admissible set hoặc projection thay vì FOC không ràng buộc.',
        },
        {
          type: 'formula',
          label: 'Pontryagin mean-field: MFG và MFC tách ở đâu?',
          content: math`$$
\begin{aligned}
&\textbf{MFG (Mean Field Game):} \\
&\quad \mathrm dp_t = -\partial_x H(t,X_t,\mu_t,p_t,\alpha_t)\,\mathrm dt + q_t\,\mathrm dW_t + q_t^0\,\mathrm dW_t^0 \\[4pt]
&\quad \mu_t = \mathcal L(X_t\mid\mathcal F_t^0) \quad \text{(fixed-point step)} \\[10pt]
\hline \\[-6pt]
&\textbf{MFC (Mean Field Control):} \\
&\quad \mathrm dp_t = -\Big[\partial_x H + \widetilde{\mathbb E}\big[\partial_\mu H(t,\widetilde X_t,\mu_t,\widetilde p_t,\widetilde\alpha_t)(X_t)\big]\Big]\mathrm dt \\[4pt]
&\qquad\qquad + q_t\,\mathrm dW_t + q_t^0\,\mathrm dW_t^0
\end{aligned}
$$`,
          note:
            'MFG agent coi law flow đã cho khi lấy best response; MFC planner nội hóa việc thay policy làm thay đổi law. Terminal condition cũng có law correction tương ứng khi g phụ thuộc μ.',
        },
        {
          type: 'comparison',
          columns: ['Phiên bản', 'State equation', 'Adjoint/costate', 'Điều kiện bổ sung'],
          rows: [
            ['Pontryagin cổ điển', 'ODE', 'ODE đi lùi', 'Minimum/maximum condition'],
            ['Stochastic maximum principle', 'SDE', 'BSDE với q', 'Adapted control và integrability'],
            ['Common-noise SMP', 'SDE với W và W⁰', 'BSDE với q và q⁰', 'Conditional information'],
            ['MFG Pontryagin', 'McKean–Vlasov trước flow đã cho', 'Adjoint của best response', 'Law consistency/fixed point'],
            ['MFC Pontryagin', 'McKean–Vlasov nội sinh', 'Adjoint có law derivative', 'Social planner optimum'],
          ],
        },
        {
          type: 'paragraph',
          content:
            'Pontryagin cho điều kiện cần trong nhiều setting; nó không tự động chứng minh nghiệm là global optimum. Nếu Hamiltonian lồi theo $(x,a)$, terminal cost lồi và admissible set lồi dưới các giả định regularity phù hợp, điều kiện Pontryagin có thể trở thành đủ. Với control đi vào diffusion, miền control không lồi hoặc hệ fully coupled, stochastic maximum principle có thể cần second-order adjoint hoặc điều kiện tinh tế hơn.',
        },
        {
          type: 'formula',
          label: 'Liên hệ Pontryagin – HJB – Deep BSDE',
          content: math`$$p_t^\star=\nabla_xV(t,X_t^\star),
\qquad
\underbrace{X_0\text{ known}}_{\text{left boundary}},
\qquad
\underbrace{p_T=\nabla g(X_T)\text{ known from }X_T}_{\text{right boundary}}.$$`,
          note:
            'Trong setting Markov trơn, costate là gradient value function dọc optimal path. Shooting phải tìm p₀ và martingale terms sao cho rollout từ biên trái chạm terminal condition ở biên phải; Deep BSDE dùng network để học các đại lượng chưa biết này.',
        },
        {
          type: 'example',
          meta: 'Ví dụ execution · control bậc hai',
          title: 'Từ Hamiltonian đến tốc độ giao dịch',
          prompt:
            'Cho dynamics $\\mathrm dX_t=-\\alpha_t\\mathrm dt+\\sigma\\mathrm dW_t$ và running control cost $\\alpha_t^\\top R\\alpha_t$, với $R\\succ0$.',
          method:
            'Giữ các hạng phụ thuộc α trong Hamiltonian rồi lấy gradient.',
          steps: [
            { label: 'Hamiltonian theo α', content: '$H(\\alpha)=\\alpha^\\top R\\alpha-p^\\top\\alpha+\\cdots$.' },
            { label: 'FOC', content: '$\\nabla_\\alpha H=2R\\alpha-p=0$.' },
            { label: 'Control tối ưu', content: '$\\alpha^\\star=\\frac12R^{-1}p$.' },
          ],
          result: '$\\boxed{\\alpha_t^\\star=\\frac12R^{-1}p_t}$',
          interpretation:
            'Adjoint lớn làm bán nhanh hơn; temporary-impact matrix R lớn làm control thận trọng hơn.',
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Hệ số 1/2 phụ thuộc convention',
          content:
            'Nếu cost viết $\\frac12\\alpha^\\top R\\alpha$ thì FOC cho $\\alpha^\\star=R^{-1}p$. Nếu cost viết $\\alpha^\\top R\\alpha$ thì xuất hiện $1/2$. Không thể sao chép control formula mà bỏ qua định nghĩa objective.',
        },
      ],
    },
    {
      heading: '8. Linear–Quadratic control và phương trình Riccati',
      eyebrow: 'Benchmark giải tích',
      summary:
        'LQ là phòng kiểm nghiệm lý tưởng: đủ giàu để có coupling ma trận nhưng vẫn cho cấu trúc value quadratic và control tuyến tính.',
      blocks: [
        {
          type: 'formula',
          label: 'Dynamics và objective LQ',
          content: math`$$
\begin{aligned}
&\textbf{1. State Dynamics:} \\
&\quad \mathrm dX_t = (BX_t + D\alpha_t)\,\mathrm dt + \Sigma\,\mathrm dW_t \\[6pt]
&\textbf{2. Global Objective Function:} \\
&\quad J(\alpha) = \mathbb E\!\left[\int_0^T (X_t^\top Q X_t + \alpha_t^\top R \alpha_t)\,\mathrm dt + X_T^\top A X_T\right]
\end{aligned}
$$`,
          note:
            'Giải thích ký hiệu: $R \\succ 0$ là ma trận chi phí giao dịch tức thời (temporary execution cost); $Q \\succeq 0$ là ma trận phạt rủi ro nắm giữ vị thế (inventory risk); $A \\succeq 0$ là phạt vị thế dư thừa cuối kỳ (terminal penalty).',
        },
        {
          type: 'formula',
          label: 'Quadratic value ansatz',
          content: math`$$V(t,x)=x^\top P_tx+c_t,\qquad \nabla_xV=2P_tx$$`,
          note:
            'P là Riccati matrix, không phải probability.',
        },
        {
          type: 'formula',
          label: 'Riccati differential equation',
          content: math`$$
\begin{aligned}
&\textbf{1. Backward Riccati Differential ODE:} \\
&\quad -\dot P_t = B^\top P_t + P_t B - P_t D R^{-1} D^\top P_t + Q \\[6pt]
&\textbf{2. Terminal Condition:} \\
&\quad P_T = A
\end{aligned}
$$`,
          note:
            'Giải thích ký hiệu: $P_t$ là nghiệm ma trận Riccati (mã hóa độ cong shadow-cost tại thời điểm $t$); $\\dot{P}_t = \\mathrm{d}P_t/\\mathrm{d}t$ là đạo hàm theo thời gian của $P_t$; $A$ là điều kiện biên cuối kỳ $P_T = A$.',
        },
        {
          type: 'formula',
          label: 'Optimal feedback control',
          content: math`$$\alpha_t^\star=-R^{-1}D^\top P_tX_t$$`,
          note:
            'Với execution dynamics D=−I, ta có α*=R⁻¹PtXt, tức inventory lớn tạo tốc độ bán lớn.',
        },
        {
          type: 'comparison',
          columns: ['Ma trận', 'Vai trò kinh tế', 'Điều kiện thường dùng'],
          rows: [
            ['$R$', 'Temporary execution/control cost', '$R\\succ0$'],
            ['$Q$', 'Running inventory risk', '$Q\\succeq0$'],
            ['$A$', 'Terminal inventory penalty', '$A\\succeq0$ hoặc $A\\succ0$'],
            ['$P_t$', 'Shadow-cost curvature tại t', 'Nghiệm Riccati đối xứng'],
          ],
        },
        {
          type: 'paragraph',
          content:
            'LQ không chỉ là ví dụ dễ. Nó cho một oracle bên ngoài để kiểm tra dấu adjoint, terminal condition, time discretization, control scaling và matrix coupling của solver. Nếu Deep BSDE không phục hồi được policy tuyến tính hoặc Riccati value trong LQ, chưa có cơ sở tin kết quả ở mô hình phi tuyến phức tạp hơn.',
        },
        {
          type: 'code',
          label: 'Python · kiểm tra residual Riccati rời rạc',
          content: code`# Backward Euler minh họa; production nên dùng ODE solver phù hợp.
P = A.copy()
P_path = [P.copy()]

for _ in range(n_steps):
    riccati_rhs = (
        B.T @ P + P @ B
        - P @ D @ np.linalg.solve(R, D.T @ P)
        + Q
    )
    P = P + dt * riccati_rhs
    P = 0.5 * (P + P.T)
    P_path.append(P.copy())

P_path = P_path[::-1]`,
        },
      ],
    },
    {
      heading: '9. Almgren–Chriss: benchmark kinh điển của optimal execution',
      eyebrow: 'Market impact và inventory risk',
      summary:
        'Almgren–Chriss biến bài toán thanh lý thành trade-off minh bạch giữa chi phí giao dịch và rủi ro giữ vị thế; dạng tổng quát còn cho phép covariance và cross-impact giữa nhiều tài sản.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Một nhà giao dịch cần thanh lý inventory $X_0$ trong horizon $[0,T]$. Bán quá nhanh làm temporary impact cao; bán quá chậm giữ exposure với price volatility lâu hơn. Almgren–Chriss xây efficient frontier giữa expected execution cost và variance của execution cost.',
        },
        {
          type: 'comparison',
          columns: ['Ký hiệu AC', 'Đọc là', 'Ý nghĩa kinh tế và đơn vị điển hình'],
          rows: [
            ['$X,\\;x_k$', 'Inventory đầu kỳ và còn lại sau bước k', 'Số cổ phiếu hoặc tỷ trọng chưa bán'],
            ['$n_k=x_{k-1}-x_k$', 'Khối lượng bán ở bước k', '$n_k>0$ theo convention sell-positive'],
            ['$\\alpha_k=n_k/\\tau$', 'Tốc độ bán', 'Khối lượng trên một đơn vị thời gian'],
            ['$\\gamma$', 'Permanent-impact scale', 'Pressure còn lại sau giao dịch; thường có đơn vị tiền/khối lượng² trong cost'],
            ['$\\eta$', 'Temporary-impact scale', 'Độ đắt của giao dịch gấp; tiền·thời gian/khối lượng²'],
            ['$\\epsilon$', 'Fixed/spread cost', 'Phí gần tuyến tính theo $|n_k|$'],
            ['$\\lambda$', 'Risk aversion', 'Mức đổi một đơn vị variance thành cost tương đương'],
            ['$\\sigma_{\\rm price}$', 'Price volatility', 'Độ bất định giá trên căn thời gian'],
            ['$\\kappa$', 'Characteristic liquidation rate', 'Đơn vị $1/\\text{time}$; $1/\\kappa$ là time scale thanh lý'],
          ],
        },
        {
          type: 'formula',
          label: 'Lịch giao dịch rời rạc',
          content: math`$$
\begin{aligned}
&\textbf{1. Time Grid and Horizon:} \qquad t_k = k\tau, \quad \tau = \frac{T}{N} \\[6pt]
&\textbf{2. Inventory Boundary Constraints:} \qquad x_0 = X, \quad x_N = 0 \\[6pt]
&\textbf{3. Discrete Trading Rate:} \qquad n_k = x_{k-1} - x_k, \quad \alpha_k = \frac{n_k}{\tau}
\end{aligned}
$$`,
          note:
            'Inventory là stock variable; n là lượng giao dịch trong một interval; α là flow/rate. Nhầm ba đại lượng này thường tạo sai hệ số τ.',
        },
        {
          type: 'formula',
          label: 'Price shock và hai loại market impact',
          content: math`$$
\begin{aligned}
&\textbf{1. Fundamental Price (Permanent Impact):} \\
&\quad S_k = S_{k-1} + \Sigma_{\rm price}^{1/2}\sqrt{\tau}\,\xi_k - \Gamma n_k, \qquad \xi_k\overset{\mathrm{iid}}{\sim}\mathcal N(0,I_d) \\[8pt]
&\textbf{2. Execution Price (Spread \& Temporary Impact):} \\
&\quad \widetilde S_k = S_{k-1} - \varepsilon\odot\operatorname{sign}(n_k) - H\alpha_k
\end{aligned}
$$`,
          note:
            'Giải thích ký hiệu kinh tế: S_k là fundamental/mid price (giá cơ sở đã chịu permanent impact \\Gamma n_k); \\widetilde S_k là execution price (giá khớp lệnh thực tế chịu thêm spread \\varepsilon và temporary impact H\\alpha_k); \\xi_k \\sim \\mathcal N(0, I_d) là cú sốc giá ngẫu nhiên; n_k là khối lượng bán bước k; \\alpha_k = n_k/\\tau là tốc độ giao dịch.',
        },
        {
          type: 'formula',
          label: 'Utility rời rạc của AC',
          content: math`$$\begin{aligned}
U[x]
&=\mathbb E[C[x]]+\lambda\,\operatorname{Var}(C[x])\\
&=
\underbrace{\frac12X^\top\Gamma X
+\sum_{k=1}^{N}\varepsilon^\top|n_k|
+\frac1{\tau}\sum_{k=1}^{N}n_k^\top\widetilde H\,n_k}_{\text{expected implementation shortfall}}\\
&\quad+
\lambda\underbrace{\tau\sum_{k=1}^{N}x_k^\top\Sigma_{\rm price}x_k}_{\text{execution-cost variance}},
\qquad
\widetilde H=H-\frac{\tau}{2}\Gamma .
\end{aligned}$$`,
          note:
            'Utility ở đây là mean–variance disutility cần tối thiểu hóa, không phải mức thỏa dụng “càng lớn càng tốt”. Với ma trận không chéo, cần tách phần đối xứng/phản đối xứng và kiểm tra quadratic temporary-impact term đủ dương.',
        },
        {
          type: 'formula',
          label: 'AC đa tài sản tổng quát: phần đối xứng và phản đối xứng',
          content: math`$$
\begin{aligned}
&\textbf{1. Impact Matrix Decomposition:} \\
&\quad H^S = \frac{H+H^\top}{2}, \quad \Gamma^S = \frac{\Gamma+\Gamma^\top}{2}, \quad \Gamma^A = \frac{\Gamma-\Gamma^\top}{2}, \quad \widetilde H = H^S - \frac{\tau}{2}\Gamma^S \\[8pt]
&\textbf{2. Expected Execution Shortfall:} \\
&\quad \mathbb E[C[x]] = \varepsilon^\top|X| + \frac{1}{2}X^\top\Gamma^SX + \sum_{k=1}^N\tau\,v_k^\top\widetilde H\,v_k + \sum_{k=1}^N\tau\,x_k^\top\Gamma^A v_k \\[8pt]
&\textbf{3. Variance Shortfall and Trading Velocity:} \\
&\quad \operatorname{Var}(C[x]) = \sum_{k=1}^N\tau\,x_k^\top\Sigma_{\rm price}x_k, \qquad v_k = \frac{n_k}{\tau}
\end{aligned}
$$`,
          note:
            'Nếu Γ đối xứng thì Γᴬ=0 và hạng cuối biến mất. AC tổng quát không buộc mọi impact matrix đều chéo; phần đối xứng kiểm soát quadratic cost, còn phần phản đối xứng có thể làm path phụ thuộc thứ tự và hướng giao dịch.',
        },
        {
          type: 'paragraph',
          content:
            'Expected shortfall đo chi phí trung bình do spread và impact; variance shortfall đo rủi ro vì vẫn còn inventory khi giá ngẫu nhiên dịch chuyển. Permanent impact tuyến tính đối xứng thường tạo một hạng gần như không đổi theo hình dạng lịch bán, trong khi temporary impact và inventory risk quyết định bán dồn đầu hay trải đều.',
        },
        {
          type: 'formula',
          label: 'Continuous-time LQ approximation',
          content: math`$$
\begin{aligned}
&\textbf{1. Objective Function:} \\
&\quad \min_{\alpha} \int_0^T \left(\eta\alpha_t^2 + \lambda\sigma^2X_t^2\right)\mathrm dt \\[6pt]
&\textbf{2. Boundary Constraints:} \\
&\quad \dot X_t = -\alpha_t, \quad X_0 = x_0, \quad X_T = 0
\end{aligned}
$$`,
          note:
            'Giải thích ký hiệu: $\\alpha_t = -\\dot{X}_t$ là tốc độ bán tại thời điểm $t$ (với $\\dot{X}_t$ là đạo hàm bậc nhất của vị thế); $\\eta$ là temporary-impact scale (chi phí thanh khoản tức thời); $\\lambda$ là hệ số ngại rủi ro (risk aversion); $\\sigma$ là price volatility.',
        },
        {
          type: 'formula',
          label: 'Từ Euler–Lagrange đến quỹ đạo liên tục',
          content: math`$$
\begin{aligned}
&\textbf{1. Euler--Lagrange ODE:} \\
&\quad \eta\,\ddot X_t - \lambda\sigma^2X_t = 0 \\[6pt]
&\textbf{2. Boundary Conditions:} \\
&\quad X(0) = x_0, \quad X(T) = 0 \\[6pt]
&\textbf{3. Trading Rate:} \\
&\quad \alpha_t = -\dot X_t
\end{aligned}
$$`,
          note:
            'Giải thích ký hiệu đạo hàm: Dấu 1 chấm trên đầu $\\dot{X}_t = \\mathrm{d}X_t/\\mathrm{d}t = -\\alpha_t$ là tốc độ bán (trading velocity); dấu 2 chấm trên đầu $\\ddot{X}_t = \\mathrm{d}^2X_t/\\mathrm{d}t^2$ là gia tốc bán (trading acceleration). Phương trình nói rằng độ cong lịch bán được quyết định bởi tỷ lệ inventory risk trên temporary liquidity cost.',
        },
        {
          type: 'formula',
          label: 'Quỹ đạo thanh lý dạng hyperbolic',
          content: math`$$
\begin{aligned}
&\textbf{1. Characteristic Liquidation Scale:} \qquad \kappa = \sqrt{\frac{\lambda\sigma^2}{\eta}} \\[6pt]
&\textbf{2. Optimal Trajectory:} \qquad X_t^\star = x_0 \frac{\sinh(\kappa(T-t))}{\sinh(\kappa T)} \\[6pt]
&\textbf{3. Optimal Trading Rate:} \qquad \alpha_t^\star = -\dot X_t^\star
\end{aligned}
$$`,
          note:
            'Đây là continuous simplification; discrete AC có temporary/permanent impact và hệ số hiệu chỉnh riêng.',
        },
        {
          type: 'formula',
          label: 'Kappa rời rạc và giới hạn liên tục',
          content: math`$$
\begin{aligned}
&\textbf{1. Discrete Impact Ratio:} \qquad \widetilde\kappa^2 = \frac{\lambda\sigma_{\rm price}^2}{\widetilde\eta} \\[6pt]
&\textbf{2. Discrete Characteristic Rate:} \qquad \kappa_{\rm discrete} = \frac{1}{\tau}\operatorname{arcosh}\left(1 + \frac{\tau^2\widetilde\kappa^2}{2}\right) \\[6pt]
&\textbf{3. Continuous Limit ($\tau \to 0$):} \qquad \lim_{\tau\to 0} \kappa_{\rm discrete} = \sqrt{\frac{\lambda\sigma_{\rm price}^2}{\eta}}
\end{aligned}
$$`,
          note:
            'κ không phải covariance hay crowding weight. κ lớn nghĩa thời gian đặc trưng 1/κ ngắn: nhà giao dịch thoát vị thế sớm hơn.',
        },
        {
          type: 'formula',
          label: 'AC liên tục nhiều tài sản',
          content: math`$$
\begin{aligned}
&\textbf{1. Continuous Formulation:} \\
&\quad \min_X \int_0^T \left(\dot X_t^\top H\dot X_t + \lambda X_t^\top\Sigma_{\rm price}X_t\right)\mathrm dt \quad \text{s.t. } X(0)=X_0,\ X(T)=0 \\[8pt]
&\textbf{2. Matrix Operators:} \\
&\quad M = \lambda H^{-1/2}\Sigma_{\rm price}H^{-1/2}, \qquad K = M^{1/2} \\[8pt]
&\textbf{3. Optimal Liquidation Trajectory:} \\
&\quad X_t^\star = H^{-1/2}\sinh\!\big(K(T-t)\big)\sinh(KT)^{-1}H^{1/2}X_0
\end{aligned}
$$`,
          note:
            'Đây là symmetric continuous form. H≻0 mã hóa liquidity/cross-impact tạm thời; Σprice⪰0 mã hóa rủi ro đồng biến động. Matrix square root làm các eigen-portfolios có tốc độ thanh lý khác nhau.',
        },
        {
          type: 'formula',
          label: 'Eigenmodes trong AC đa tài sản rời rạc',
          content: math`$$
\begin{aligned}
&\textbf{1. Eigendecomposition:} \\
&\quad A = \widetilde H^{-1/2}\Sigma_{\rm price}\widetilde H^{-1/2}, \qquad \lambda A = U\,\operatorname{diag}(\widetilde\kappa_1^2,\ldots,\widetilde\kappa_d^2)U^\top \\[8pt]
&\textbf{2. Decoupled Mode Dynamics:} \\
&\quad \frac{2}{\tau^2}\big(\cosh(\kappa_j\tau)-1\big) = \widetilde\kappa_j^2, \qquad z_{j,k} = \frac{\sinh(\kappa_j(T-t_k))}{\sinh(\kappa_jT)}z_{j,0} \\[8pt]
&\textbf{3. Coordinate Transformations:} \\
&\quad y_k = \widetilde H^{1/2}x_k, \qquad z_k = U^\top y_k \implies x_k = \widetilde H^{-1/2} U z_k
\end{aligned}
$$`,
          note:
            'Ta xoay danh mục sang các eigen-portfolios của hình học risk–liquidity. Mỗi mode j có κⱼ riêng; vì thế covariance và cross-impact có thể coupling lịch bán giữa các tài sản.',
        },
        {
          type: 'diagram',
          kind: 'ac-layers',
          title: 'Ba lớp của Almgren–Chriss',
          caption:
            'Bản rời rạc gần implementation shortfall; bản liên tục cho trực giác vi phân; bản đa tài sản đưa covariance và cross-impact vào hình học ma trận.',
        },
        {
          type: 'diagram',
          kind: 'ac-tradeoff',
          title: 'Risk aversion thay đổi hình dạng liquidation path',
          caption:
            'λ hoặc σ lớn làm κ lớn và policy front-load hơn; η lớn làm giao dịch gấp đắt hơn nên đường thanh lý phẳng hơn.',
        },
        {
          type: 'comparison',
          columns: ['Tham số tăng', 'Tác động lên κ', 'Hành vi điển hình'],
          rows: [
            ['$\\lambda$', 'Tăng', 'Bán sớm hơn để giảm inventory risk'],
            ['$\\sigma$', 'Tăng', 'Giảm exposure nhanh hơn'],
            ['$\\eta$', 'Giảm', 'Trải giao dịch đều hơn để tránh impact'],
            ['$T$', 'Không nằm trực tiếp trong κ', 'Horizon dài cho nhiều thời gian thực thi hơn'],
          ],
        },
        {
          type: 'insight',
          tone: 'teal',
          title: 'Vì sao AC là benchmark mạnh?',
          content:
            'AC có ý nghĩa kinh tế rõ, nghiệm tham chiếu và path shape dễ kiểm tra. Một phương pháp mới nên chứng minh nó phục hồi AC khi tắt các thành phần phi tuyến/mean-field, rồi mới tuyên bố giá trị ở môi trường phức tạp hơn.',
        },
        {
          type: 'insight',
          tone: 'rose',
          title: 'Không gọi mọi chênh lệch so với AC là cải thiện',
          content:
            'Nếu hai policy được chấm bằng objective khác nhau, terminal convention khác nhau hoặc mean-flow environment khác nhau thì thứ hạng không có ý nghĩa. AC không “sai”; nó chỉ không được thiết kế cho mọi loại law interaction và strategic crowding.',
        },
      ],
    },
    {
      heading: '9A. Almgren–Chriss trong pipeline: diagonal impact, full-covariance risk',
      eyebrow: 'Dạng triển khai riêng',
      summary:
        'Sau AC tổng quát, mục này khóa đúng benchmark được dùng: giải AC vô hướng theo từng tài sản, ghép các path thành ma trận inventory và chấm rủi ro bằng price covariance đầy đủ.',
      blocks: [
        {
          type: 'insight',
          tone: 'amber',
          title: 'AC gốc và benchmark triển khai không bị đồng nhất',
          content:
            'Phần trước trình bày không gian mô hình AC chuẩn, gồm cả cross-impact và eigenmodes. Phần này chỉ mô tả specialization dùng trong pipeline. Vì impact matrices được chọn chéo, đây không phải nghiệm full-matrix AC; nhưng vì evaluator vẫn dùng covariance đầy đủ, đây cũng không phải mô hình bỏ qua correlation risk.',
        },
        {
          type: 'formula',
          label: 'Từ return covariance sang price covariance',
          content: math`$$\Sigma_{\rm price}
=
\operatorname{diag}(S_0)\,
\Sigma_{\rm return,annual}\,
\operatorname{diag}(S_0),
\qquad
\sigma_i=\sqrt{(\Sigma_{\rm price})_{ii}}.$$`,
          note:
            'Return covariance không cùng đơn vị với price-risk covariance. Nhân hai phía bởi mức giá tham chiếu đưa covariance về đơn vị tiền²/thời gian; volatility biên σᵢ được đưa vào solver scalar.',
        },
        {
          type: 'formula',
          label: 'Disutility rời rạc của evaluator',
          content: math`$$
\begin{aligned}
&\textbf{Mean--Variance Disutility Objective:} \\
&\quad J_{\rm AC}^{\rm impl} = \underbrace{\frac{1}{2}\sum_{i=1}^{d}\gamma_iX_i^2 + \sum_{k=1}^{N}\sum_{i=1}^{d}\epsilon_i|n_{k,i}| + \frac{1}{\tau}\sum_{k=1}^{N}\sum_{i=1}^{d}\widetilde\eta_i n_{k,i}^2}_{\text{expected shortfall}} \\
&\qquad\qquad + \lambda\underbrace{\tau\sum_{k=1}^{N}x_k^\top\Sigma_{\rm price}x_k}_{\text{variance shortfall}}, \qquad \widetilde\eta_i = \eta_i - \frac{\gamma_i\tau}{2} > 0
\end{aligned}
$$`,
          note:
            'Tên utility trong code là mean–variance disutility cần tối thiểu hóa. Permanent, spread và temporary impact tách theo từng tài sản; covariance ngoài đường chéo chỉ xuất hiện trong variance shortfall.',
        },
        {
          type: 'formula',
          label: 'Dựng từng path rồi chấm jointly',
          content: math`$$\begin{aligned}
\kappa_i=
\frac1{\tau}\operatorname{arcosh}
\left(
1+\frac{\tau^2}{2}
\frac{\lambda\sigma_i^2}{\widetilde\eta_i}
\right),
\qquad
x_{k,i}
=X_i
\frac{\sinh\!\big(\kappa_i(T-t_k)\big)}
{\sinh(\kappa_iT)},
\\[10pt]
n_{k,i}=x_{k-1,i}-x_{k,i},
\qquad
V_{\rm port}
=\tau\sum_{k=1}^{N}x_k^\top\Sigma_{\rm price}x_k .
\end{aligned}$$`,
          note:
            'Nếu λ=0, implementation dùng đường thẳng $x_{k,i}=X_i(1-t_k/T)$ và đặt κᵢ=0. Nếu λ>0, mỗi tài sản dùng nghiệm hyperbolic riêng; evaluator mới ghép các cột qua full covariance.',
        },
        {
          type: 'comparison',
          columns: ['Thành phần', 'Specialization dùng', 'Không nên diễn giải thành'],
          rows: [
            ['Permanent impact', 'Vector $\\gamma_i$', 'Permanent cross-impact tổng quát $\\Gamma_{ij}$'],
            ['Temporary impact', 'Vector $\\eta_i$', 'Temporary cross-impact tổng quát $H_{ij}$'],
            ['Liquidation path', 'Một scalar AC solve cho mỗi tài sản', 'Joint eigenmode optimum'],
            ['Portfolio risk', '$x_k^\\top\\Sigma_{\\rm price}x_k$', 'Chỉ dùng variance riêng lẻ'],
            ['Terminal handling', 'Đo leftover trước khi có thể force-liquidate', 'Policy tự hoàn thành nếu phần dư bị che'],
          ],
        },
        {
          type: 'code',
          label: 'Python · specialization đúng với benchmark',
          content: code`def ac_optimal_trajectory(
    X, T, N, sigma_price, gamma, eta, epsilon, risk_lambda
):
    tau = T / N
    time = np.linspace(0.0, T, N + 1)
    eta_tilde = eta - 0.5 * gamma * tau
    if eta_tilde <= 0:
        raise ValueError("AC requires eta_tilde > 0")

    if risk_lambda <= 0:
        x = X * (1.0 - time / T)
        kappa = 0.0
    else:
        kappa_sq = risk_lambda * sigma_price**2 / eta_tilde
        kappa = np.arccosh(1.0 + 0.5 * tau**2 * kappa_sq) / tau
        x = X * np.sinh(kappa * (T - time)) / np.sinh(kappa * T)
        x[0], x[-1] = X, 0.0

    n = x[:-1] - x[1:]
    shortfall = (
        0.5 * gamma * X**2
        + epsilon * np.abs(n).sum()
        + (eta_tilde / tau) * np.square(n).sum()
    )
    variance = sigma_price**2 * tau * np.square(x[1:]).sum()
    return x, n, shortfall, variance, kappa


def compose_multidim_ac(
    x0, prices0, cov_return_annual, gamma, eta, epsilon,
    risk_lambda, T, N,
):
    cov_price = (
        np.diag(prices0) @ cov_return_annual @ np.diag(prices0)
    )
    sigma = np.sqrt(np.diag(cov_price))
    solved = [
        ac_optimal_trajectory(
            x0[i], T, N, sigma[i], gamma[i], eta[i],
            epsilon[i], risk_lambda,
        )
        for i in range(len(x0))
    ]
    inventory = np.column_stack([item[0] for item in solved])
    trades = np.column_stack([item[1] for item in solved])
    expected_shortfall = sum(item[2] for item in solved)

    tau = T / N
    variance = sum(
        tau * inventory[k] @ cov_price @ inventory[k]
        for k in range(1, N + 1)
    )
    utility = expected_shortfall + risk_lambda * variance
    return inventory, trades, utility`,
        },
        {
          type: 'insight',
          tone: 'teal',
          title: 'Vì sao specialization này vẫn hữu ích?',
          content:
            'Nó cho một baseline có nghiệm ổn định, cost decomposition rõ và đủ nhạy với rủi ro danh mục khi chấm điểm. Sau đó mean-field model mới được kiểm tra dưới một objective mở rộng. Giá trị của benchmark nằm ở khả năng cô lập lỗi và tạo mốc đối chứng, không nằm ở việc giả vờ rằng mọi cross-impact đã được giải.',
        },
      ],
    },
    {
      heading: '10. Từ nhiều agent đến McKean–Vlasov và empirical law',
      eyebrow: 'Tương tác quần thể',
      summary:
        'Khi mỗi agent chịu ảnh hưởng của phân phối trạng thái hoặc hành động của cả quần thể, dynamics trở thành McKean–Vlasov và state space mở rộng sang không gian xác suất.',
      blocks: [
        {
          type: 'formula',
          label: 'Hệ N agent tương tác',
          content: math`$$\mathrm dX_t^{i,N}
=
b\!\left(t,X_t^{i,N},\alpha_t^{i,N},\mu_t^N\right)\mathrm dt
+\sigma\,\mathrm dW_t^i
+\sigma_0\,\mathrm dW_t^0,
\qquad
\mu_t^N=\frac1N\sum_{j=1}^{N}\delta_{X_t^{j,N}}$$`,
          note:
            'μtN là empirical law; Wi là private noise; W0 là common noise.',
        },
        {
          type: 'formula',
          label: 'Giới hạn McKean–Vlasov đại diện',
          content: math`$$\mathrm dX_t
=
b\!\left(t,X_t,\alpha_t,\mathcal L(X_t\mid\mathcal F_t^0)\right)\mathrm dt
+\sigma\,\mathrm dW_t
+\sigma_0\,\mathrm dW_t^0$$`,
          note:
            'Khi có common noise, law giới hạn thường là conditional law ngẫu nhiên theo thông tin chung F⁰t.',
        },
        {
          type: 'comparison',
          columns: ['Law feature', 'Giữ thông tin gì?', 'Chi phí tính toán'],
          rows: [
            ['Mean $\\bar X_t$', 'Vị trí trung bình', 'Thấp'],
            ['Mean + variance', 'Vị trí và dispersion', 'Thấp–vừa'],
            ['Moments bậc cao', 'Skewness/tail thô', 'Vừa'],
            ['Histogram / quantiles', 'Hình dạng distribution', 'Vừa–cao'],
            ['DeepSets / attention embedding', 'Representation học được', 'Cao'],
            ['Empirical particles trực tiếp', 'Law giàu nhất trong sample', 'Rất cao'],
          ],
        },
        {
          type: 'paragraph',
          content:
            'Mean field không đồng nghĩa “lấy trung bình rồi xong”. Nếu cost chỉ phụ thuộc mean inventory thì mean đủ. Nếu cost phạt dispersion, tail hoặc nonlinear crowding, một vector mean có thể làm mất thông tin quyết định. Law encoder phải tương thích với dependency thật của dynamics và objective.',
        },
        {
          type: 'formula',
          label: 'Private và common diffusion',
          content: math`$$\operatorname{Cov}(\mathrm dX_t^i\mid\mathcal F_t)
=
(\Sigma_{\mathrm{id}}\Sigma_{\mathrm{id}}^\top+\Sigma_0\Sigma_0^\top)\mathrm dt,
\qquad
\operatorname{Cov}(\mathrm dX_t^i,\mathrm dX_t^j\mid\mathcal F_t)
=
\Sigma_0\Sigma_0^\top\mathrm dt$$`,
          note:
            'Với i≠j và private noises độc lập, cross-agent covariance chỉ đến từ common noise.',
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Propagation of chaos có điều kiện',
          content:
            'Không có common noise, các particle có thể trở nên gần độc lập khi N lớn dưới giả định phù hợp. Có common noise, chúng vẫn độc lập có điều kiện theo common-noise history, nhưng không độc lập vô điều kiện.',
        },
      ],
    },
    {
      heading: '11. Mean Field Game: cân bằng của các agent chiến lược',
      eyebrow: 'Decentralized equilibrium',
      summary:
        'MFG mô tả một agent vô cùng nhỏ tối ưu lợi ích riêng khi coi population flow là đã cho, rồi yêu cầu law sinh ra phải trùng với law giả định.',
      blocks: [
        {
          type: 'steps',
          title: 'Hai bước định nghĩa một MFG equilibrium',
          items: [
            'Best response: cố định một flow $m=(m_t)$, giải bài toán control của representative agent để tìm $\\alpha^{m,\\star}$.',
            'Consistency: chạy state dưới $\\alpha^{m,\\star}$ và yêu cầu $m_t=\\mathcal L(X_t^{m,\\star})$ hoặc conditional law khi có common noise.',
          ],
        },
        {
          type: 'formula',
          label: 'Representative-agent problem với flow m cho trước',
          content: math`$$\alpha^{m,\star}
\in
\arg\min_{\alpha\in\mathcal A}
\mathbb E\!\left[
\int_0^T f(t,X_t,\alpha_t,m_t)\,\mathrm dt
+g(X_T,m_T)
\right]$$`,
          note:
            'Trong bước best response, một agent vô cùng nhỏ không nội hóa tác động riêng của mình lên mt.',
        },
        {
          type: 'formula',
          label: 'Fixed-point consistency',
          content: math`$$m_t=\mathcal L(X_t^{\alpha^{m,\star}}),\qquad 0\leq t\leq T$$`,
          note:
            'MFG equilibrium là fixed point giữa law dự đoán và law thực sự do best responses tạo ra.',
        },
        {
          type: 'diagram',
          kind: 'mfg-mfc',
          title: 'MFG và MFC khác nhau ở việc ai nội hóa externality',
          caption:
            'MFG là cân bằng phi hợp tác: mỗi agent tối ưu riêng. MFC là bài toán planner: một policy được chọn để tối ưu social objective của toàn law.',
        },
        {
          type: 'paragraph',
          content:
            'Trong trade crowding, một agent tối ưu trước mean trading flow của đám đông. Hành động cá nhân nhỏ có tác động bậc $1/N$ lên population nên bị bỏ qua ở giới hạn MFG, nhưng tổng hợp các hành động lại tạo price pressure hoặc congestion có ý nghĩa. Đây là externality cốt lõi.',
        },
        {
          type: 'comparison',
          columns: ['Điều kiện', 'Ý nghĩa'],
          rows: [
            ['Optimality', 'Không agent nào cải thiện cost riêng bằng unilateral deviation'],
            ['Consistency', 'Population flow dùng để tối ưu đúng bằng flow policy tạo ra'],
            ['Symmetry', 'Các agent cùng loại dùng cùng feedback rule'],
            ['Heterogeneity', 'Có thể mở rộng bằng type/risk-aversion distribution'],
          ],
        },
        {
          type: 'insight',
          tone: 'rose',
          title: 'Một policy tốt chưa đủ để là MFG equilibrium',
          content:
            'Nếu policy tối ưu với một mean flow m nhưng rollout của policy tạo mean flow khác, ta mới có best response với môi trường sai, chưa có equilibrium. Fixed-point residual phải được báo cáo riêng.',
        },
      ],
    },
    {
      heading: '12. Mean Field Control: social planner tối ưu toàn quần thể',
      eyebrow: 'Cooperative optimum',
      summary:
        'MFC chọn policy để tối ưu social cost và nội hóa tác động của policy lên toàn bộ distribution.',
      blocks: [
        {
          type: 'formula',
          label: 'Mean Field Control objective',
          content: math`$$\inf_{\alpha\in\mathcal A}
\mathbb E\!\left[
\int_0^T f\!\left(t,X_t,\alpha_t,\mathcal L(X_t)\right)\mathrm dt
+g\!\left(X_T,\mathcal L(X_T)\right)
\right]$$`,
          note:
            'Khác MFG best response, law ở đây không được đóng băng bên ngoài optimization.',
        },
        {
          type: 'paragraph',
          content:
            'Khi planner thay đổi policy, distribution của mọi agent thay đổi. Vì vậy first-order condition của MFC thường có thêm population derivative hoặc Lions derivative theo measure. Đây là toán học của việc nội hóa externality: planner tính cả tác động gián tiếp qua law lên social objective.',
        },
        {
          type: 'formula',
          label: 'Sơ đồ derivative của social objective',
          content: math`$$\frac{\mathrm d}{\mathrm d\varepsilon}J(\alpha+\varepsilon\beta)\Big|_{\varepsilon=0}
=
\underbrace{\text{direct state/control effect}}_{\text{representative-agent effect}}
+
\underbrace{\text{law effect}}_{\text{population-distribution effect}}$$`,
          note:
            'MFG representative agent thường chỉ có direct effect trong best response; MFC phải tính cả law effect.',
        },
        {
          type: 'comparison',
          columns: ['Khía cạnh', 'MFG', 'MFC'],
          rows: [
            ['Hành vi', 'Phi hợp tác', 'Hợp tác / planner'],
            ['Mục tiêu', 'Cost riêng của agent', 'Social average cost'],
            ['Law trong tối ưu', 'Cố định rồi fixed point', 'Nội sinh trong cùng bài toán'],
            ['Externality', 'Không nội hóa đầy đủ', 'Được nội hóa'],
            ['Kết quả', 'Nash equilibrium', 'Social optimum'],
          ],
        },
        {
          type: 'insight',
          tone: 'teal',
          title: 'MFC không có nghĩa điều khiển từng agent bằng tay',
          content:
            'Planner có thể thiết kế một feedback policy phân tán dùng state riêng và law feature chung. “Centralized objective” không bắt buộc “centralized execution” nếu cấu trúc mean-field cho phép policy phi tập trung.',
        },
      ],
    },
    {
      heading: '13. MFG, MFC và Price of Anarchy',
      eyebrow: 'Hiệu quả kinh tế',
      summary:
        'Price of Anarchy đo tổn thất hiệu quả do hành vi phi hợp tác bằng cách so social cost của equilibrium với social optimum.',
      blocks: [
        {
          type: 'formula',
          label: 'PoA cho bài toán cost minimization',
          content: math`$$\operatorname{PoA}
=
\frac{
\displaystyle\sup_{\alpha\in\mathcal E_{\mathrm{MFG}}}J_{\mathrm{social}}(\alpha)
}{
\displaystyle\inf_{\alpha\in\mathcal A}J_{\mathrm{social}}(\alpha)
}
=
\frac{J_{\mathrm{social}}^{\mathrm{worst\ MFG}}}{J_{\mathrm{social}}^{\mathrm{MFC}}}$$`,
          note:
            'Nếu equilibrium duy nhất, tử số là social cost của equilibrium đó.',
        },
        {
          type: 'formula',
          label: 'Diễn giải',
          content: math`$$\operatorname{PoA}=1\ \Longrightarrow\ \text{socially efficient equilibrium},\qquad \operatorname{PoA}>1\ \Longrightarrow\ \text{non-cooperative inefficiency}$$`,
          note:
            'PoA≥1 khi cost không âm, cùng social objective, cùng admissible set và MFC thật sự đạt social optimum.',
        },
        {
          type: 'example',
          open: true,
          meta: 'Ví dụ đọc chỉ số · cost minimization',
          title: 'Một equilibrium đắt hơn social optimum bao nhiêu?',
          prompt:
            'Giả sử social cost của MFG equilibrium là 125 và social optimum MFC là 100.',
          method: 'Lấy tỷ số cost equilibrium trên cost planner.',
          steps: [
            { label: 'Tính PoA', content: '$\\operatorname{PoA}=125/100=1.25$.' },
            { label: 'Đọc tỷ số', content: 'Equilibrium dùng 125% cost của social optimum.' },
            { label: 'Đọc inefficiency', content: 'Excess social cost là $(125-100)/100=25\\%$.' },
          ],
          result: '$\\boxed{\\operatorname{PoA}=1.25}$',
          interpretation:
            'Hành vi phi hợp tác tạo social cost cao hơn 25% so với policy planner trong cùng mô hình.',
        },
        {
          type: 'comparison',
          columns: ['Chỉ số', 'Công thức', 'Câu hỏi'],
          rows: [
            ['Price of Anarchy', 'Worst equilibrium / optimum', 'Equilibrium tệ nhất kém bao nhiêu?'],
            ['Price of Stability', 'Best equilibrium / optimum', 'Equilibrium tốt nhất gần optimum đến đâu?'],
            ['Absolute gap', '$J_{MFG}-J_{MFC}$', 'Tốn thêm bao nhiêu đơn vị cost?'],
            ['Relative gap', '$(J_{MFG}-J_{MFC})/J_{MFC}$', 'Tốn thêm bao nhiêu phần trăm?'],
          ],
        },
        {
          type: 'insight',
          tone: 'rose',
          title: 'PoA nhỏ hơn 1 là tín hiệu audit, không phải kỳ tích',
          content:
            'Trong cost minimization đúng chuẩn, MFC là social optimum nên một MFG policy không thể có social cost thấp hơn. PoA<1 thường báo objective mismatch, solver MFC chưa hội tụ, khác terminal handling, khác sample paths hoặc sai dấu.',
        },
        {
          type: 'code',
          label: 'Python · protocol tính PoA công bằng',
          content: code`# Cùng evaluator, cùng paths và cùng social objective.
mfg_cost = evaluate_social_cost(
    policy=mfg_policy,
    noise_paths=shared_noise,
    terminal_rule=terminal_rule,
)
mfc_cost = evaluate_social_cost(
    policy=mfc_policy,
    noise_paths=shared_noise,
    terminal_rule=terminal_rule,
)

poa = mfg_cost / mfc_cost
relative_gap = (mfg_cost - mfc_cost) / mfc_cost`,
        },
      ],
    },
    {
      heading: '14. Vì sao dùng Deep BSDE thay vì lưới PDE?',
      eyebrow: 'Lựa chọn phương pháp số',
      summary:
        'Deep BSDE hấp dẫn khi state dimension, common noise và law dependence làm grid-based PDE trở nên đắt; nó không phải lựa chọn mặc định cho mọi bài toán.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Một PDE trên $d$ chiều với $M$ grid points mỗi chiều cần cỡ $M^d$ điểm. Đây là curse of dimensionality. Deep BSDE đi theo quỹ đạo Monte Carlo và xấp xỉ các unknown functions bằng neural networks, tránh xây toàn bộ lưới không gian. Bài báo của Han, Jentzen và E cho thấy cách biến một số PDE parabolic số chiều cao thành bài toán học BSDE.',
        },
        {
          type: 'diagram',
          kind: 'deep-bsde-pipeline',
          title: 'Deep BSDE biến boundary-value problem thành learning problem',
          caption:
            'Network đề xuất unknown initial/martingale objects; rollout mô phỏng tiến; terminal mismatch tạo loss; automatic differentiation cập nhật network.',
        },
        {
          type: 'comparison',
          columns: ['Phương pháp', 'Điểm mạnh', 'Giới hạn'],
          rows: [
            ['Finite difference / finite element', 'Chính xác, dễ audit ở low dimension', 'Grid tăng theo cấp số nhân'],
            ['Regression BSDE', 'Monte Carlo, có nền BSDE rõ', 'Basis selection khó khi d lớn'],
            ['Deep BSDE', 'Không cần state grid, dùng GPU/mini-batch', 'Training phi lồi, terminal loss có thể khó'],
          ],
        },
        {
          type: 'steps',
          title: 'Khi Deep BSDE là lựa chọn hợp lý',
          items: [
            'State dimension đủ cao khiến grid PDE không thực tế.',
            'Dynamics và objective có thể mô phỏng, vi phân và lấy mẫu hiệu quả.',
            'Terminal condition hoặc adjoint structure cung cấp supervision nội sinh.',
            'Có benchmark low-dimensional hoặc LQ để kiểm tra solver.',
            'Có ngân sách Monte Carlo, nhiều seed và diagnostic đường đi.',
          ],
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Không có free lunch khỏi curse of dimensionality',
          content:
            'Deep BSDE tránh grid explosion nhưng chuyển độ khó sang approximation error, optimization error, time-discretization error và Monte Carlo error. “Chạy được ở d=100” không tự động chứng minh nghiệm đúng.',
        },
      ],
    },
    {
      heading: '15. ANN trong Deep BSDE học đối tượng nào?',
      eyebrow: 'Function approximation',
      summary:
        'Neural network không nhất thiết học control trực tiếp; tùy formulation, nó có thể học Y₀, adjoint p₀, martingale loading Z/q hoặc law representation.',
      blocks: [
        {
          type: 'comparison',
          columns: ['Network/module', 'Input điển hình', 'Output'],
          rows: [
            ['Initial-value net', '$X_0$, law features, type', '$Y_0$ hoặc $p_0$'],
            ['Martingale net', '$t,X_t,Y_t,\\phi(\\mu_t)$', '$Z_t$, $q_t$, $q_t^0$'],
            ['Control net', '$t,X_t,p_t,\\phi(\\mu_t)$', '$\\alpha_t$ khi không dùng closed-form FOC'],
            ['Law encoder', 'Particles $\\{X_t^i\\}$', 'Permutation-invariant embedding $\\phi(\\mu_t^N)$'],
            ['Value net', '$t,x,\\mu$', '$V(t,x,\\mu)$ trong direct/PDE method'],
          ],
        },
        {
          type: 'formula',
          label: 'Một MLP cơ bản',
          content: math`$$h^{(0)}=u,\qquad h^{(\ell+1)}=\varphi(W_\ell h^{(\ell)}+b_\ell),\qquad \operatorname{NN}_\theta(u)=W_Lh^{(L)}+b_L$$`,
          note:
            'u có thể ghép time, normalized state, adjoint và law embedding.',
        },
        {
          type: 'formula',
          label: 'DeepSets law encoder',
          content: math`$$\phi(\mu_t^N)\approx\rho_\theta\!\left(\frac1N\sum_{i=1}^{N}\psi_\theta(X_t^i)\right)$$`,
          note:
            'Averaging tạo permutation invariance: đổi thứ tự particle không đổi representation.',
        },
        {
          type: 'code',
          label: 'PyTorch · time-conditioned martingale network',
          content: code`class MartingaleNet(nn.Module):
    def __init__(self, state_dim, law_dim, hidden=128):
        super().__init__()
        in_dim = 1 + state_dim + state_dim + law_dim
        self.net = nn.Sequential(
            nn.Linear(in_dim, hidden),
            nn.SiLU(),
            nn.LayerNorm(hidden),
            nn.Linear(hidden, hidden),
            nn.SiLU(),
            nn.Linear(hidden, state_dim * state_dim),
        )
        self.state_dim = state_dim

    def forward(self, t, x, p, law):
        features = torch.cat([t, x, p, law], dim=-1)
        q = self.net(features)
        return q.view(*q.shape[:-1], self.state_dim, self.state_dim)`,
        },
        {
          type: 'paragraph',
          content:
            'Output shape là phần của formulation. Nếu $W_t\\in\\mathbb R^m$ và adjoint $p_t\\in\\mathbb R^d$, martingale loading đầy đủ thường có shape $d\\times m$. Dùng vector $q\\in\\mathbb R^d$ ngầm giả định diagonal noise loading hoặc element-wise coupling.',
        },
        {
          type: 'comparison',
          columns: ['Thiết kế', 'Khi phù hợp', 'Rủi ro'],
          rows: [
            ['Một net cho mỗi time step', 'Lưới cố định, đơn giản', 'Số tham số tăng theo Ntime'],
            ['Một shared time-conditioned net', 'Cần chia sẻ qua thời gian', 'Khó học terminal boundary sắc'],
            ['Residual connection', 'Deep networks, state gần identity', 'Cần kiểm scale'],
            ['tanh output cho control', 'Control bounded', 'Saturation làm gradient nhỏ'],
            ['softplus cho positive parameter', 'Cần positivity', 'Có thể lệch scale ban đầu'],
          ],
        },
        {
          type: 'insight',
          tone: 'rose',
          title: 'ANN không tự biết symmetry và constraints',
          content:
            'Nếu output phải là SPD matrix, inventory phải không âm hoặc control phải bị chặn, kiến trúc/parameterization phải mã hóa điều đó. Penalty loss có thể hỗ trợ nhưng không bảo đảm constraint chính xác.',
        },
      ],
    },
    {
      heading: '16. Thuật toán rời rạc hóa, rollout và hàm loss',
      eyebrow: 'Deep shooting',
      summary:
        'Deep BSDE thường học unknown initial/martingale objects bằng cách mô phỏng toàn quỹ đạo tiến rồi phạt sai terminal boundary.',
      blocks: [
        {
          type: 'formula',
          label: 'Euler–Maruyama cho forward state',
          content: math`$$X_{k+1}=X_k+b(t_k,X_k,\alpha_k,\mu_k)\Delta t+\sigma_k\Delta W_k+\sigma_{0,k}\Delta W_k^0$$`,
          note:
            'Strong error của Euler–Maruyama thường bậc 1/2 trong điều kiện chuẩn; finer grid giảm bias nhưng tăng depth huấn luyện.',
        },
        {
          type: 'formula',
          label: 'Euler scheme cho adjoint BSDE',
          content: math`$$p_{k+1}=p_k-\nabla_xH_k\Delta t+q_k\Delta W_k+q_k^0\Delta W_k^0$$`,
          note:
            'Dấu drift phải khớp convention dp=−∇xHdt+qdW+q⁰dW⁰.',
        },
        {
          type: 'formula',
          label: 'Terminal shooting loss',
          content: math`$$\mathcal L_{\mathrm{terminal}}(\theta)=\mathbb E\!\left[\left\|p_N^\theta-\nabla_xg(X_N^\theta,\mu_N^\theta)\right\|_2^2\right]$$`,
          note:
            'Đây là supervision nội sinh: không cần nhãn policy từ Riccati hay AC.',
        },
        {
          type: 'formula',
          label: 'Bài toán shooting phụ trợ',
          content: math`$$\begin{aligned}
\inf_{y_0,z}
J_{\rm FBSDE}(y_0,z)
=
\mathbb E\!\left[
\left\|
Y_T^{y_0,z}
-G\!\left(X_T^{y_0,z},\mathcal L(X_T^{y_0,z})\right)
\right\|_2^2
\right],
\\[10pt]
\begin{cases}
\mathrm dX_t=B(t,X_t,\mu_t,Y_t)\,\mathrm dt+\sigma\,\mathrm dW_t,\\
\mathrm dY_t=-F(t,X_t,\mu_t,Y_t)\,\mathrm dt
+z(t,X_t,\mu_t)\,\mathrm dW_t,\\
Y_0=y_0(X_0,\mu_0).
\end{cases}
\end{aligned}$$`,
          note:
            'Sau khi chọn y₀ và z, cả X lẫn Y đều được rollout theo chiều tiến. Neural network tham số hóa y₀ và z; terminal mismatch kiểm xem đường tiến có chạm biên lùi hay không.',
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Shooting problem không phải economic control problem ban đầu',
          content:
            'Bài toán gốc tối ưu control kinh tế $\\alpha$. Sau Pontryagin, nghiệm được đặc trưng bởi FBSDE. Deep BSDE lại tạo một bài toán số phụ trợ tối ưu $y_0,z$ để thỏa terminal boundary. Hai tầng liên hệ qua điều kiện tối ưu, nhưng không được gọi terminal loss là economic objective.',
        },
        {
          type: 'steps',
          title: 'Một training step chuẩn',
          items: [
            'Lấy mini-batch initial states, private noises và common noises mới.',
            'Tạo $p_0^\\theta$ hoặc $Y_0^\\theta$ từ initial-value network.',
            'Ở mỗi time step, tính law feature, q/q⁰, control và cập nhật state–adjoint.',
            'Tại T, tính terminal mismatch và các path regularizers đã khai báo.',
            'Backpropagate qua toàn rollout, clip gradient nếu cần và cập nhật optimizer.',
            'Đánh giá trên seed/noise paths độc lập, không dùng batch huấn luyện.',
          ],
        },
        {
          type: 'code',
          label: 'Pseudo-PyTorch · một rollout FBSDE',
          content: code`x = sample_initial_state(batch, particles, d)
p = p0_net(x, encode_law(x))

for k in range(n_steps):
    t = time_grid[k]
    law = encode_law(x)
    q = q_net(t, x, p, law)
    q0 = q0_net(t, x, p, law)

    alpha = optimal_control(x, p, law)
    dW = sample_private_brownian(x.shape, dt)
    dW0 = sample_common_brownian(batch, d, dt)

    x = x + state_drift(x, alpha, law) * dt \
          + private_diffusion(dW) \
          + common_diffusion(dW0)
    p = p - grad_x_hamiltonian(x, alpha, p, law) * dt \
          + apply(q, dW) + apply(q0, dW0)

target = terminal_adjoint(x, encode_law(x))
loss = ((p - target) ** 2).mean()
loss.backward()`,
        },
        {
          type: 'comparison',
          columns: ['Loss term', 'Mục đích', 'Nguy cơ nếu weight quá lớn'],
          rows: [
            ['Terminal adjoint', 'Thỏa FBSDE boundary', 'Bỏ qua chất lượng path giữa kỳ'],
            ['Terminal inventory', 'Khuyến khích liquidation', 'Bán gấp/spike cuối kỳ'],
            ['Cumulative sell', 'Giữ budget identity', 'Ép policy cứng, giảm thích nghi noise'],
            ['Smoothness', 'Giảm control oscillation', 'Làm policy phản ứng chậm'],
            ['Economic objective', 'Tối ưu cost thật', 'Scale lớn làm terminal residual khó học'],
            ['q/q⁰ penalty', 'Ổn định martingale loading', 'Bias nghiệm về quá deterministic'],
          ],
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Regularization là lựa chọn số, không phải định lý kinh tế',
          content:
            'Mỗi auxiliary loss thay đổi optimization landscape và có thể thay đổi nghiệm học được. Cần ablation, sensitivity theo weight và luôn báo cáo objective gốc bên cạnh training loss tổng hợp.',
        },
      ],
    },
    {
      heading: '17. Xây dựng mô hình execution nhiều tài sản có mean field',
      eyebrow: 'Từ theory đến specification',
      summary:
        'Một mô hình chuyên nghiệp phải tách rõ dynamics, objective, interaction, source của tham số và protocol so sánh.',
      blocks: [
        {
          type: 'formula',
          label: 'Inventory dynamics nhiều tài sản',
          content: math`$$\mathrm dX_t^i
=
-\alpha_t^i\,\mathrm dt
+\Sigma_{\mathrm{id}}\,\mathrm dW_t^i
+\Sigma_0\,\mathrm dW_t^0$$`,
          note:
            'X và α thuộc Rᵈ; diffusion matrices có thể mang covariance geometry giữa các tài sản.',
        },
        {
          type: 'formula',
          label: 'Một objective có control, risk và crowding',
          content: math`$$J^i(\alpha^i;\mu)
=
\mathbb E\!\left[
\int_0^T
\left(
(\alpha_t^i)^\top R\alpha_t^i
+(X_t^i)^\top QX_t^i
+\Psi(X_t^i,\alpha_t^i,\mu_t)
\right)\mathrm dt
+(X_T^i)^\top AX_T^i
\right]$$`,
          note:
            'Ψ chứa mean-field interaction; R, Q, A cần có đơn vị và tính xác định phù hợp.',
        },
        {
          type: 'formula',
          label: 'Ví dụ crowding theo mean trading flow',
          content: math`$$\Psi(X_t,\alpha_t,\mu_t)=X_t^\top C\,\bar\alpha_t,\qquad \bar\alpha_t=\int a\,\mu_t(\mathrm dx,\mathrm da)$$`,
          note:
            'Dấu của C và convention α>0 là bán phải được tuyên bố để xác định crowding làm tăng hay giảm cost.',
        },
        {
          type: 'comparison',
          columns: ['Thành phần', 'Nguồn hợp lý', 'Không nên nhầm với'],
          rows: [
            ['$R$', 'Spread/temporary impact/scenario', 'Return covariance'],
            ['$Q$', 'Risk aversion × covariance theo đúng đơn vị', 'Diffusion matrix'],
            ['$A$', 'Terminal liquidation preference', 'Riccati matrix P'],
            ['$C$', 'Cross-impact/crowding assumption', 'Covariance ký hiệu Σ'],
            ['$\\Sigma_{id},\\Sigma_0$', 'State-noise scenario + asset geometry', 'Price volatility scalar'],
          ],
        },
        {
          type: 'steps',
          title: 'Quy trình specification trước khi code',
          items: [
            'Khóa state, control, sign convention và đơn vị của từng vector.',
            'Viết dynamics cùng chiều Brownian và independence/common-noise assumptions.',
            'Viết objective ở một nơi duy nhất; kiểm dimensional consistency.',
            'Chứng minh/kiểm tra R≻0, Q⪰0, A⪰0 và convexity cần thiết.',
            'Suy Hamiltonian, adjoint terminal condition và control FOC bằng tay.',
            'Tách tham số dữ liệu, structural assumptions và training hyperparameters.',
            'Định nghĩa MFG consistency hoặc MFC law derivative trước khi chọn network.',
          ],
        },
        {
          type: 'insight',
          tone: 'rose',
          title: 'Correlation không tự sinh crowding',
          content:
            'Return covariance mô tả đồng biến động rủi ro. Cross-impact hoặc crowding mô tả cơ chế hành vi/price pressure. Có thể dùng correlation để thiết kế một prior cho interaction matrix, nhưng đó là modeling choice cần sensitivity analysis, không phải hệ quả thống kê bắt buộc.',
        },
      ],
    },
    {
      heading: '18. Benchmark, chẩn đoán và kỷ luật triển khai',
      eyebrow: 'Model risk',
      summary:
        'Một kết quả Deep BSDE đáng tin phải vượt qua benchmark cấu trúc, không chỉ có training loss thấp.',
      blocks: [
        {
          type: 'steps',
          title: 'Năm tầng benchmark khuyến nghị',
          items: [
            'Tầng 1 — LQ/Riccati: kiểm dấu, terminal adjoint, feedback control và matrix coupling.',
            'Tầng 2 — Almgren–Chriss: kiểm scalar path, diagonal-impact evaluator, completion và impact–risk trade-off.',
            'Tầng 3 — Mean-control bridge: bật interaction nhỏ, kiểm mean-flow update và zero-interaction limit.',
            'Tầng 4 — Empirical-law/noise diagnostic: bật Deep Sets, private/common noise, q/q⁰ và particle refinement.',
            'Tầng 5 — Economic comparison: so MFG, MFC và baseline dưới cùng crowding evaluator, terminal rule và noise paths.',
          ],
        },
        {
          type: 'comparison',
          columns: ['Metric', 'Nó trả lời gì?', 'Không đủ để kết luận gì?'],
          rows: [
            ['Terminal loss', 'Boundary có gần thỏa?', 'Policy có economic cost tốt?'],
            ['Relative L2 control error', 'Có gần reference policy?', 'Có đúng terminal inventory?'],
            ['Inventory path error', 'State trajectory có đúng hình?', 'Objective component nào gây sai?'],
            ['Fixed-point residual', 'MFG law có nhất quán?', 'Equilibrium có social efficiency?'],
            ['Social objective', 'Policy nào tốt hơn dưới evaluator?', 'Solver có thỏa FBSDE?'],
            ['PoA', 'Inefficiency equilibrium/planner', 'Nguồn cụ thể của inefficiency'],
          ],
        },
        {
          type: 'formula',
          label: 'Error budget cần nhận diện',
          content: math`$$\text{total numerical error}
\approx
\text{model error}
+\text{time discretization}
+\text{particle error}
+\text{network approximation}
+\text{optimization}
+\text{Monte Carlo evaluation}$$`,
          note:
            'Không phải các thành phần luôn cộng tuyến tính; công thức là checklist phân rã nguyên nhân.',
        },
        {
          type: 'comparison',
          columns: ['Failure mode', 'Dấu hiệu', 'Diagnostic'],
          rows: [
            ['Terminal collapse', 'Loss thấp nhưng path phi kinh tế', 'Plot α, X, cumulative sell'],
            ['q explosion', 'NaN/gradient spike', 'q norm theo time và batch'],
            ['Common-noise leakage', 'Validation quá tốt', 'Tách train/valid noise tensors'],
            ['Over-regularization', 'Policy quá phẳng', 'Ablation từng loss weight'],
            ['False dominance', 'Mọi baseline đều thua lớn', 'Audit objective/units/terminal rule'],
            ['Fixed-point failure', 'Best response flow lệch rollout flow', 'Report law residual'],
            ['Dimension scaling artifact', 'Cost giảm khi d tăng bất thường', 'Per-asset và total metrics song song'],
          ],
        },
        {
          type: 'code',
          label: 'Python · seed-level confidence summary',
          content: code`seed_summary = (
    results.groupby(["method", "dimension"])["objective"]
    .agg(["mean", "std", "count"])
)
seed_summary["se"] = seed_summary["std"] / np.sqrt(seed_summary["count"])
seed_summary["ci95_low"] = (
    seed_summary["mean"] - 1.96 * seed_summary["se"]
)
seed_summary["ci95_high"] = (
    seed_summary["mean"] + 1.96 * seed_summary["se"]
)`,
        },
        {
          type: 'insight',
          tone: 'teal',
          title: 'Chuẩn doanh nghiệp: model card trước dashboard',
          content:
            'Trước khi trình bày đường cong đẹp, cần khóa version dữ liệu, commit, seed list, dimension grid, objective definition, parameter units, hardware, stopping rule và evaluator. Reproducibility metadata là một phần của kết quả.',
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Kết luận phải có phạm vi',
          content:
            'Một solver thắng baseline trong một objective crowding cụ thể chỉ hỗ trợ lợi thế có điều kiện trong môi trường đó. Nó không chứng minh Deep BSDE phổ quát hơn AC, MFG luôn kém MFC trong mọi metric, hay simulation policy có thể triển khai thị trường thật mà không kiểm định thêm.',
        },
      ],
    },
    {
      heading: '19. Từ điển ký hiệu: đọc công thức mà không bị ngợp',
      eyebrow: 'Notation literacy',
      summary:
        'Ký hiệu toán học là một ngôn ngữ nén. Tách từng lớp — loại đối tượng, phép toán, điều kiện và ý nghĩa kinh tế — sẽ biến một hệ phương trình dài thành một chuỗi mệnh đề có thể đọc được.',
      blocks: [
        {
          type: 'formula',
          label: 'Giải mã một dòng Gaussian thường gặp',
          content: math`$$\xi_k^{\mathrm{iid}}\sim\mathcal N(0,I_d)$$`,
          note:
            'Đọc: các vector shock ξ ở từng bước k độc lập và cùng phân phối Gaussian d chiều, có mean vector bằng 0 và covariance bằng ma trận đơn vị Iᵈ.',
        },
        {
          type: 'comparison',
          columns: ['Ký hiệu', 'Đọc như thế nào?', 'Nó khẳng định điều gì?'],
          rows: [
            ['$\\sim$', '“có phân phối”', '$X\\sim\\mathcal N(0,1)$ không có nghĩa X xấp xỉ 0'],
            ['$\\stackrel{\\mathrm{iid}}{\\sim}$', 'independent and identically distributed', 'Độc lập giữa mẫu và dùng cùng một law'],
            ['$\\mathcal N(m,\\Sigma)$', 'Gaussian mean m, covariance Σ', 'Tham số thứ hai là covariance, không phải standard deviation'],
            ['$0$', 'Zero scalar/vector theo ngữ cảnh', 'Trong Gaussian d chiều, đây là vector $0_d$'],
            ['$I_d$', 'Identity matrix cấp d', 'Variance mỗi chiều bằng 1; Gaussian joint còn cho độc lập giữa các component'],
            ['$:=\\;$ hoặc $\\equiv$', 'Được định nghĩa là', 'Quan hệ định nghĩa, mạnh hơn một phép tính tình cờ'],
            ['$\\in$', 'Thuộc về', '$x\\in\\mathbb R^d$ nói loại và số chiều của x'],
            ['$\\forall,\\exists$', 'Với mọi, tồn tại', 'Lượng từ quyết định độ mạnh của mệnh đề'],
            ['$\\text{a.s.}$', 'Almost surely', 'Đúng ngoại trừ một tập biến cố xác suất 0'],
          ],
        },
        {
          type: 'formula',
          label: 'Gradient, Hessian, divergence và trace',
          content: math`$$\begin{aligned}
\nabla_x f=
\begin{bmatrix}
\partial f/\partial x_1\\[-0.1em]\vdots\\[-0.1em]\partial f/\partial x_d
\end{bmatrix},
\qquad
\nabla_x^2f=
\left[\frac{\partial^2f}{\partial x_i\partial x_j}\right]_{i,j},
\qquad
\operatorname{Tr}(A)=\sum_{i=1}^d A_{ii}.
\end{aligned}$$`,
          note:
            'Tam giác ngược ∇ là nabla/gradient; ∇² là Hessian. Tr là trace: tổng đường chéo, đồng thời bằng tổng eigenvalue kể cả khi không cần tính từng eigenvalue.',
        },
        {
          type: 'formula',
          label: 'Vì sao trace xuất hiện trong Itô',
          content: math`$$\mathrm dV(t,X_t)
=
\left(
\partial_tV+\nabla V^\top b
+\frac12\operatorname{Tr}
\big(\sigma\sigma^\top\nabla^2V\big)
\right)\mathrm dt
+\nabla V^\top\sigma\,\mathrm dW_t.$$`,
          note:
            'Trace co toàn bộ covariance của shock với độ cong của value function thành một scalar risk correction. Curvature lớn theo hướng biến động mạnh tạo Itô adjustment lớn.',
        },
        {
          type: 'comparison',
          columns: ['Ký hiệu', 'Tên', 'Cách hiểu trong mô hình'],
          rows: [
            ['$P_t$', 'Ma trận phụ thuộc thời gian', 'Riccati curvature tại thời điểm t'],
            ['$\\dot P_t=\\mathrm dP_t/\\mathrm dt$', 'Time derivative', 'Tốc độ từng phần tử của P thay đổi theo thời gian'],
            ['$A^\\top$', 'Transpose', 'Đổi hàng thành cột; dùng trong quadratic form và covariance'],
            ['$A^{-1}$', 'Inverse', 'Chỉ tồn tại khi A khả nghịch; code nên solve thay vì tạo inverse trực tiếp'],
            ['$A^{1/2}$', 'Matrix square root', 'Ma trận B sao cho $BB=A$ theo convention phù hợp; khác square từng phần tử'],
            ['$\\langle x,y\\rangle=x^\\top y$', 'Inner product', 'Mức cùng hướng; trong Hamiltonian ghép drift với shadow price'],
            ['$\\odot$', 'Hadamard product', 'Nhân từng phần tử, khác nhân ma trận'],
            ['$\\operatorname{diag}(v)$', 'Diagonal matrix', 'Đưa vector lên đường chéo'],
            ['$\\det(A)$', 'Determinant', 'Bằng tích eigenvalue; det gần 0 báo gần suy biến'],
          ],
        },
        {
          type: 'comparison',
          columns: ['Ký hiệu tối ưu', 'Kết quả trả về', 'Ví dụ đọc'],
          rows: [
            ['$\\min_a f(a)$', 'Giá trị nhỏ nhất', 'Chi phí nhỏ nhất đạt được'],
            ['$\\arg\\min_a f(a)$', 'Điểm/nghiệm tối ưu', 'Control $a^\\star$ làm cost nhỏ nhất'],
            ['$\\max,\\arg\\max$', 'Giá trị lớn nhất và điểm đạt nó', 'Dùng khi viết reward/utility cần tối đa hóa'],
            ['$\\inf$', 'Greatest lower bound', 'Có thể không có điểm nào thực sự đạt cận dưới'],
            ['$\\sup$', 'Least upper bound', 'Có thể không có maximizer; “sup” không tự động là “max”'],
            ['$a^\\star$ hoặc $a^*$', 'Optimal candidate/solution', 'Dấu sao nghĩa tối ưu trong bài toán đang xét, không phải phép nhân'],
            ['$V^\\star$', 'Optimal value', 'Giá trị objective khi dùng policy tối ưu'],
            ['$\\widehat a$', 'Estimator/ước lượng', 'Kết quả từ dữ liệu hoặc thuật toán, chưa chắc tối ưu'],
            ['$a^\\theta$', 'Hàm tham số hóa', 'Policy/network phụ thuộc trọng số θ'],
          ],
        },
        {
          type: 'comparison',
          columns: ['Ký hiệu law', 'Ý nghĩa chính xác'],
          rows: [
            ['$\\mathcal L(X)$ hoặc $\\operatorname{Law}(X)$', 'Phân phối xác suất của random variable X'],
            ['$\\mu_t$', 'Một probability measure tại thời điểm t; không mặc nhiên là mean'],
            ['$\\mu_t^N=N^{-1}\\sum_i\\delta_{X_t^i}$', 'Empirical measure từ N particles'],
            ['$\\delta_x$', 'Dirac mass: toàn bộ khối lượng xác suất đặt tại x'],
            ['$\\mathcal F_t^0$', 'Thông tin sinh bởi common noise đến thời điểm t'],
            ['$\\mathcal L(X_t\\mid\\mathcal F_t^0)$', 'Conditional law; bản thân nó ngẫu nhiên theo common-noise history'],
            ['$\\widetilde X$', 'Independent copy dùng để viết law derivative/expectation'],
            ['$\\widetilde{\\mathbb E}$', 'Expectation chỉ theo independent copy, giữ biến gốc cố định'],
          ],
        },
        {
          type: 'worked-example',
          meta: 'Giải mã ký hiệu · đọc từ trái sang phải',
          title: 'Đọc hệ MFG có common noise',
          prompt: math`$$\mathrm dX_t=b(t,X_t,\mu_t,\alpha_t)\mathrm dt
+\Sigma\,\mathrm dW_t+\Sigma_0\,\mathrm dW_t^0,
\qquad
\mu_t=\operatorname{Law}(X_t\mid\mathcal F_t^0).$$`,
          method:
            'Xác định loại của từng đối tượng trước, rồi mới đọc phép toán và quan hệ kinh tế.',
          steps: [
            {
              label: 'State',
              content: '$X_t\\in\\mathbb R^d$ là inventory của một agent đại diện.',
            },
            {
              label: 'Drift',
              content: '$b\\,\\mathrm dt$ là thay đổi có hệ thống do control và interaction với population law.',
            },
            {
              label: 'Private shock',
              content: '$\\Sigma\\,\\mathrm dW_t$ làm agent lệch khỏi quần thể.',
            },
            {
              label: 'Common shock',
              content: '$\\Sigma_0\\,\\mathrm dW_t^0$ dịch chuyển nhiều agent cùng lúc.',
            },
            {
              label: 'Consistency',
              content: '$\\mu_t$ không được chọn tùy ý; nó phải là conditional law do chính dynamics sinh ra.',
            },
          ],
          result:
            'Một phương trình ngắn đồng thời chứa dynamics cá nhân, covariance geometry, cấu trúc thông tin và điều kiện nhất quán quần thể.',
          interpretation:
            'Private noise là khác biệt riêng; common noise là cú sốc vĩ mô/thanh khoản chung; law là trạng thái tổng hợp của thị trường.',
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Ký hiệu chỉ có nghĩa sau khi khóa convention',
          content:
            '$\\alpha>0$ có thể được định nghĩa là bán hoặc mua; Hamiltonian có thể viết cho bài toán min hoặc max; quadratic cost có thể có hoặc không có hệ số $1/2$. Vì vậy dấu sao, FOC và hệ số 2 phải được đọc cùng định nghĩa objective, không đọc tách rời.',
        },
      ],
    },
    {
      heading: '20. Chuẩn, không gian L² và hình học sai số',
      eyebrow: 'Geometry của sai số',
      summary:
        'Norm biến “độ lớn” và “độ gần” thành đại lượng có thể tối ưu. Chuẩn L² đặc biệt quan trọng vì nó tạo một Hilbert space, nơi trực giao, phép chiếu và Pythagoras giải thích MSE, conditional expectation và nhiều loss của Deep BSDE.',
      blocks: [
        {
          type: 'formula',
          label: 'Các chuẩn vector thường gặp',
          content: math`$$\|x\|_1=\sum_{i=1}^d|x_i|,
\qquad
\|x\|_2=\sqrt{\sum_{i=1}^dx_i^2},
\qquad
\|x\|_\infty=\max_i|x_i|,
\qquad
\|x\|_Q^2=x^\top Qx.$$`,
          note:
            'Chuẩn L1 đo tổng độ lớn, L2 là khoảng cách Euclid, L∞ nhìn component tệ nhất. Weighted norm dùng Q để phạt mạnh hơn theo các hướng kinh tế/rủi ro quan trọng.',
        },
        {
          type: 'comparison',
          columns: ['Đối tượng', 'Chuẩn', 'Dùng để đo'],
          rows: [
            ['Vector $x$', '$\\|x\\|_2$', 'Độ lớn inventory/control tại một thời điểm'],
            ['Ma trận $A$', '$\\|A\\|_F=\\sqrt{\\operatorname{Tr}(A^\\top A)}$', 'Tổng năng lượng phần tử; Frobenius norm'],
            ['Toán tử $A$', '$\\|A\\|_2=\\sup_{x\\ne0}\\|Ax\\|_2/\\|x\\|_2$', 'Mức khuếch đại lớn nhất; spectral norm'],
            ['Random variable $X$', '$\\|X\\|_{L^2}=(\\mathbb E|X|^2)^{1/2}$', 'RMS dưới probability law'],
            ['Process $X_t$', '$(\\mathbb E\\int_0^T\\|X_t\\|_2^2\\,dt)^{1/2}$', 'Năng lượng trung bình trên cả horizon'],
            ['Path array', '$\\|A-B\\|_F/\\|B\\|_F$', 'Relative L2/Frobenius error trong benchmark'],
          ],
        },
        {
          type: 'formula',
          label: 'Không gian Lᵖ của random variables',
          content: math`$$L^p(\Omega,\mathcal F,\mathbb P)
=
\left\{X:\mathbb E|X|^p<\infty\right\},
\qquad
\|X\|_{L^p}=\big(\mathbb E|X|^p\big)^{1/p}.$$`,
          note:
            'Chữ L² không có nghĩa “bình phương một vector”. Nó là không gian các random variables có second moment hữu hạn, với norm lấy cả độ lớn lẫn xác suất.',
        },
        {
          type: 'formula',
          label: 'Pythagoras trong inner-product space',
          content: math`$$\langle u,v\rangle=0
\quad\Longrightarrow\quad
\|u+v\|_2^2=\|u\|_2^2+\|v\|_2^2.$$`,
          note:
            'Đây là phiên bản tổng quát của tam giác vuông. Điều kiện quyết định là trực giao; không được áp dụng cho hai vector bất kỳ.',
        },
        {
          type: 'formula',
          label: 'Conditional expectation là phép chiếu L²',
          content: math`$$\begin{aligned}
\widehat X=\mathbb E[X\mid\mathcal G],
\qquad
\mathbb E\!\left[(X-\widehat X)Z\right]=0
\quad \forall Z\in L^2(\mathcal G),
\\[10pt]
\mathbb E|X-Z|^2
=
\mathbb E|X-\widehat X|^2
+\mathbb E|\widehat X-Z|^2.
\end{aligned}$$`,
          note:
            'Pythagorean identity chứng minh E[X|G] là estimator dùng thông tin G có MSE nhỏ nhất. Đây là hình học nền sau least squares, regression và việc xấp xỉ các conditional objects bằng neural network.',
        },
        {
          type: 'paragraph',
          content:
            'Trong BSDE, martingale integrand $Z_t$ hoặc $q_t$ mã hóa phần phản ứng tối ưu với thông tin ngẫu nhiên mới. Khi network học một hàm của $(t,X_t,\\mu_t)$ bằng squared loss, ta đang tìm một phép chiếu gần đúng trong một lớp hàm hữu hạn. Pythagoras không đảm bảo neural optimizer tìm global optimum, nhưng giải thích vì sao bình phương sai số là objective tự nhiên khi đối tượng lý tưởng là một conditional expectation hoặc projection.',
        },
        {
          type: 'formula',
          label: 'Sample variance và câu hỏi s² có phải variance?',
          content: math`$$s^2
=
\frac{1}{n-1}\sum_{i=1}^n(x_i-\bar x)^2,
\qquad
\bar x=\frac1n\sum_{i=1}^nx_i.$$`,
          note:
            'Đúng: s² thường ký hiệu sample variance không chệch. Population variance thường là σ². Nếu code dùng mean(...²) với mẫu số n thì đó là empirical second central moment theo convention MLE, không đúng y hệt s² mẫu số n−1.',
        },
        {
          type: 'formula',
          label: 'Relative L², RMSE và cosine đo ba điều khác nhau',
          content: math`$$\begin{aligned}
\operatorname{RelL2}(a,b)
=
\frac{\|a-b\|_2}{\max(\|b\|_2,\varepsilon)},
\qquad
\operatorname{RMSE}(a,b)
=
\sqrt{\frac1m\sum_{j=1}^m(a_j-b_j)^2},
\\[10pt]
\operatorname{CosSim}(a,b)
=
\frac{\langle a,b\rangle}
{\max(\|a\|_2\|b\|_2,\varepsilon)}.
\end{aligned}$$`,
          note:
            'Relative L2 đo sai số theo scale reference; RMSE giữ đơn vị gốc; cosine chủ yếu đo hướng/shape. Một policy có cosine cao vẫn có thể sai amplitude.',
        },
        {
          type: 'code',
          label: 'Python · gọi đúng loại chuẩn',
          content: code`def relative_l2(value, reference, eps=1e-12):
    value = np.asarray(value, dtype=float)
    reference = np.asarray(reference, dtype=float)
    return np.linalg.norm(value - reference) / max(
        np.linalg.norm(reference), eps
    )

rmse = np.sqrt(np.mean((value - reference) ** 2))
frobenius = np.linalg.norm(matrix, ord="fro")
spectral = np.linalg.norm(matrix, ord=2)

# PyTorch terminal L² loss:
terminal_loss = torch.mean(
    torch.sum((p_T - terminal_target) ** 2, dim=-1)
)`,
        },
        {
          type: 'insight',
          tone: 'rose',
          title: '“Norm nhỏ” chỉ có nghĩa khi biết scale và denominator',
          content:
            'Sai số tuyệt đối 0.01 có thể nhỏ với inventory 1 nhưng lớn với inventory 0.001. Relative error lại bùng nổ khi reference gần 0. Vì vậy phải báo cả absolute metric, relative metric, denominator guard ε và đơn vị.',
        },
      ],
    },
    {
      heading: '21. Full Law: từ phân phối xác suất đến Deep Sets',
      eyebrow: 'Measure-valued state',
      summary:
        '“Full Law” nghĩa policy hoặc dynamics có thể phụ thuộc vào hình dạng của cả phân phối, không chỉ mean. Trong tính toán, law vô hạn chiều thường được thay bằng empirical particles và một representation bất biến theo thứ tự.',
      blocks: [
        {
          type: 'comparison',
          columns: ['Mức representation', 'Giữ được gì?', 'Có thể làm mất gì?'],
          rows: [
            ['Mean only $m_t$', 'Vị trí trung tâm', 'Dispersion, skewness, tails, multimodality'],
            ['Mean + covariance', 'Trung tâm và độ phân tán tuyến tính', 'Asymmetry và cấu trúc tail'],
            ['Một số moments/quantiles', 'Các đặc trưng được chọn trước', 'Thông tin ngoài feature set'],
            ['Empirical law $\\mu_t^N$', 'Cloud hạt hữu hạn', 'Sampling error giữa empirical và population law'],
            ['Deep Sets embedding', 'Set feature học được, permutation invariant', 'Bị giới hạn bởi N, latent dimension và training'],
            ['Exact law $\\mu_t$', 'Probability measure đầy đủ', 'Đối tượng vô hạn chiều, khó tính trực tiếp'],
          ],
        },
        {
          type: 'formula',
          label: 'Không gian luật có second moment hữu hạn',
          content: math`$$\mathcal P_2(\mathbb R^d)
=
\left\{
\mu:\mu\text{ is a probability measure},\;
\int_{\mathbb R^d}\|x\|_2^2\,\mu(\mathrm dx)<\infty
\right\}.$$`,
          note:
            'Chỉ số 2 nối Full Law với geometry L²/Wasserstein: second moment phải hữu hạn để nhiều cost bậc hai và khoảng cách W₂ có nghĩa.',
        },
        {
          type: 'formula',
          label: 'Empirical measure và Deep Sets encoder',
          content: math`$$\mu_t^N=\frac1N\sum_{j=1}^N\delta_{X_t^j},
\qquad
e_t^\theta
=
\rho_\theta\!\left(
\frac1N\sum_{j=1}^N\phi_\theta(X_t^j)
\right).$$`,
          note:
            'Dùng cùng φ cho mọi particle rồi mean-pool khiến embedding không đổi khi hoán vị thứ tự agent. ρ sau pooling biến summary thành law feature.',
        },
        {
          type: 'diagram',
          kind: 'full-law-encoder',
          title: 'Từ particle cloud đến policy phụ thuộc law',
          caption:
            'Các agent không có thứ tự tự nhiên. Shared encoder và symmetric pooling tạo law embedding, sau đó adjoint/control network nhận state cá nhân cùng thông tin quần thể.',
        },
        {
          type: 'formula',
          label: 'Policy và martingale heads phụ thuộc law',
          content: math`$$p_0^\theta=p_0^\theta(X_0,e_0),\qquad
q_t^\theta=q^\theta(t,X_t,e_t),\qquad
q_t^{0,\theta}=q^{0,\theta}(t,X_t,e_t),
\qquad
\alpha_t^\theta=\mathcal C\!\left(\tfrac12R^{-1}p_t^\theta,X_t\right).$$`,
          note:
            'C là control map áp ràng buộc. q phản ứng private noise; q⁰ phản ứng common noise. Law embedding là input, không thay thế terminal condition hay Hamiltonian.',
        },
        {
          type: 'formula',
          label: 'Common noise biến law thành random measure',
          content: math`$$\mu_t=\mathcal L(X_t\mid\mathcal F_t^0),
\qquad
\mu_t(\omega^0)\in\mathcal P_2(\mathbb R^d).$$`,
          note:
            'Sau khi cố định một common-noise path ω⁰, ta có một conditional distribution của agent. Đổi common shock thì cả distribution này đổi.',
        },
        {
          type: 'formula',
          label: 'Lions derivative: đạo hàm theo một probability law',
          content: math`$$\begin{aligned}
F(\mu)=\widetilde F(\xi),\qquad \mu=\mathcal L(\xi),
\qquad
D\widetilde F(\xi)
=
\partial_\mu F(\mu)(\xi),
\\[10pt]
\mathrm dp_t
=-
\left[
\partial_xH(t,X_t,\mu_t,p_t,\alpha_t)
+\widetilde{\mathbb E}\!
\left[
\partial_\mu H(t,\widetilde X_t,\mu_t,\widetilde p_t,\widetilde\alpha_t)(X_t)
\right]
\right]\mathrm dt
+q_t\,\mathrm dW_t+q_t^0\,\mathrm dW_t^0.
\end{aligned}$$`,
          note:
            'Ta “lift” hàm trên measures thành hàm của random variable trong L² rồi lấy Fréchet derivative. Biến trong ngoặc cuối $X_t$ là điểm tại đó measure derivative được đánh giá.',
        },
        {
          type: 'paragraph',
          content:
            'MFG và MFC xử lý law khác nhau. Trong MFG, một agent đại diện xem flow $\\mu$ là môi trường ngoại sinh khi giải best response, sau đó áp consistency $\\mu=\\operatorname{Law}(X^{\\alpha^\\star})$. Trong MFC, planner thay policy của cả quần thể nên phải nội hóa tác động lên law. Không nên chèn hạng Lions derivative vào mọi nhánh chỉ vì công thức tổng quát có nó: dependency thực sự của objective mới quyết định hạng nào tồn tại.',
        },
        {
          type: 'comparison',
          columns: ['Cụm từ', 'Khẳng định hợp lý', 'Khẳng định quá mức'],
          rows: [
            ['Full-law input', 'Network nhận empirical particle cloud qua set encoder', 'Đã quan sát probability law liên tục chính xác'],
            ['Full-MV rollout', 'Có empirical law, private và common noise', 'Đã giải chính xác master equation'],
            ['Permutation invariant', 'Đổi thứ tự particles không đổi pooled embedding', 'Embedding giữ mọi thông tin của distribution'],
            ['Particle approximation', 'Hội tụ có thể xảy ra dưới giả định và N→∞', 'N hữu hạn không có sampling error'],
            ['Law derivative correction', 'Planner nội hóa distribution effect đã đặc tả', 'Mọi MFC luôn có cùng multiplier/công thức'],
          ],
        },
        {
          type: 'code',
          label: 'PyTorch · Deep Sets tối giản',
          content: code`class EmpiricalLawEncoder(nn.Module):
    def __init__(self, d, hidden, law_dim):
        super().__init__()
        self.phi = nn.Sequential(
            nn.Linear(d, hidden), nn.ReLU(),
            nn.Linear(hidden, law_dim),
        )
        self.rho = nn.Sequential(
            nn.Linear(law_dim, hidden), nn.ReLU(),
            nn.Linear(hidden, law_dim),
        )

    def forward(self, particles):
        # particles: [batch, agents, d]
        encoded = self.phi(particles)
        pooled = encoded.mean(dim=1)  # invariant theo thứ tự agents
        return self.rho(pooled)

# Unit test symmetry:
e1 = encoder(x)
e2 = encoder(x[:, torch.randperm(x.shape[1])])
assert torch.allclose(e1, e2, atol=1e-6)`,
        },
        {
          type: 'steps',
          title: 'Full-Law audit tối thiểu',
          items: [
            'Permutation test: hoán vị particles không đổi law embedding/policy aggregate.',
            'Particle-size test: tăng N và theo dõi objective, law moments, fixed-point residual.',
            'Moment collision test: tạo hai distributions cùng mean nhưng khác variance/tail để xem encoder có phân biệt.',
            'Noise channel test: tắt riêng private và common noise; theo dõi q và q⁰ norms.',
            'Conditional test: dùng chung common-noise path khi so các policy.',
            'Law ablation: thay Deep Sets bằng mean/moments để đo giá trị thật của representation giàu hơn.',
          ],
        },
        {
          type: 'insight',
          tone: 'rose',
          title: '“Full Law” là mục tiêu representation, không phải giấy chứng nhận chính xác',
          content:
            'Một empirical cloud hữu hạn đi qua neural encoder vẫn có particle error, approximation error và optimization error. Cách viết chuyên nghiệp là “particle approximation với permutation-invariant law encoder”, kèm N, latent dimension và diagnostics.',
        },
      ],
    },
    {
      heading: '21A. Full Law trong pipeline: moment closure và empirical-law diagnostic',
      eyebrow: 'Dạng triển khai riêng',
      summary:
        'Lý thuyết Full Law ở mục trước được dùng để thiết kế hai specialization khác nhau: một nhánh Deep Sets để stress-test biểu diễn law/noise và một nhánh moment closure để so sánh MFG/MFC về kinh tế.',
      blocks: [
        {
          type: 'comparison',
          columns: ['Nhánh', 'Population descriptor', 'Nhiệm vụ'],
          rows: [
            ['Economic MFG/MFC', '$m_t^N$ và $\\bar\\alpha_t^N$', 'Best response, planner, crowding và Price-of-Anarchy diagnostics'],
            ['Empirical-law diagnostic', '$\\mu_t^N$ qua Deep Sets', 'Permutation invariance, $p_0$, private/common noise, $q$ và $q^0$'],
            ['Exact Full Law theory', '$\\mu_t=\\mathcal L(X_t\\mid\\mathcal F_t^0)$', 'Nền khái niệm; không phải exact master-equation solver'],
          ],
        },
        {
          type: 'formula',
          label: 'Moment closure dùng cho nhánh kinh tế',
          content: math`$$\begin{aligned}
m_t^N=\frac1N\sum_{i=1}^{N}X_t^i,
\qquad
\bar\alpha_t^N=\frac1N\sum_{i=1}^{N}\alpha_t^i,
\\[10pt]
F_{\rm crowd}(x,\alpha,\bar\alpha)
=
\omega_p\,x^\top C\bar\alpha
+\omega_\tau\,\alpha^\top C\bar\alpha .
\end{aligned}$$`,
          note:
            'MFG nhận mean-control flow như môi trường trong best response rồi cập nhật flow bằng outer fixed point. MFC sinh flow nội sinh từ population rollout và dùng planner driver. Nhánh này không gọi Deep Sets trong vòng lặp kinh tế.',
        },
        {
          type: 'formula',
          label: 'Dispersion term dùng cho empirical-law diagnostic',
          content: math`$$\begin{aligned}
m_t^N=\frac1N\sum_{i=1}^{N}X_t^i,
\qquad
F_{\rm disp}^N
=\frac1N\sum_{i=1}^{N}
(X_t^i-m_t^N)^\top G(X_t^i-m_t^N),
\\[10pt]
\nabla_xH_{\rm MFG}^{\rm diag}
=2Qx+2G(x-m),
\qquad
\nabla_xH_{\rm MFC}^{\rm diag}
=2Qx+4G(x-m).
\end{aligned}$$`,
          note:
            'Hệ số 2/4 là convention của diagnostic adapter để tạo hai chế độ direct/social effect. Objective này khác adverse-crowding objective ở trên, nên không dùng hai cost của nhánh này để lập PoA kinh tế.',
        },
        {
          type: 'code',
          label: 'Pseudocode · routing đúng population feature',
          content: code`if branch == "economic":
    population_feature = {
        "mean_inventory": particles.mean(dim=0),
        "mean_control": mean_alpha_flow[k],
    }
    driver = economic_mfg_or_mfc_driver(population_feature)

elif branch == "empirical_law_diagnostic":
    law_embed = law_encoder(particles)
    q = q_net(t, particles, law_embed)
    q0 = q0_net(t, particles, law_embed)
    driver = dispersion_driver(mode="MFG" or "MFC")

# Không đổi objective/evaluator chỉ vì hai nhánh cùng dùng particles.`,
        },
        {
          type: 'insight',
          tone: 'rose',
          title: 'Tên “Full-MV” không đồng nghĩa exact Full Law',
          content:
            'Có empirical particles, Deep Sets, private noise và common noise mới chứng minh rằng solver có một representation giàu hơn mean-only. Nó chưa chứng minh hội tụ tới law liên tục, chưa giải master equation và chưa thay thế moment-closure objective dùng trong economic comparison.',
        },
      ],
    },
    {
      heading: '22. Giải phẫu mô hình mẹ: từ kinh tế đến một bước code',
      eyebrow: 'Source of truth của các nhánh',
      summary:
        'Thân cây chung là hệ state–objective–adjoint với terminal target $2AX_T$. Các nhánh chỉ thay population descriptor, interaction driver, control constraints và protocol fixed point; không thay tùy ý objective để có kết quả đẹp.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Câu chuyện kinh tế bắt đầu trước phương trình: một agent giữ vector inventory, muốn giảm vị thế trong thời hạn hữu hạn, trả liquidity cost khi giao dịch, chịu rủi ro khi còn giữ hàng và có thể bị ảnh hưởng bởi dòng lệnh của quần thể. Mô hình toán chỉ là cách ghi chính xác năm câu hỏi: state là gì, agent điều khiển gì, noise nào quan sát được, cost nào cần tối thiểu và market interaction đi qua mean hay full law.',
        },
        {
          type: 'formula',
          label: 'Mô hình mẹ reduced-form được dùng',
          content: math`$$\begin{aligned}
\mathrm dX_t^i
&=-\alpha_t^i\,\mathrm dt
+\Sigma_{\rm id}\,\mathrm dW_t^i
+\Sigma_0\,\mathrm dW_t^0,\\
J(\alpha)
&=\mathbb E\!\left[
\int_0^T
\Big(
\alpha_t^\top R\alpha_t
+X_t^\top QX_t
+F_{\rm pop}(X_t,\alpha_t;\mathsf P_t)
\Big)\mathrm dt
+X_T^\top AX_T
\right].
\end{aligned}$$`,
          note:
            'R≻0 phạt tốc độ giao dịch, Q⪰0 phạt inventory trong kỳ, A⪰0 phạt tồn kho cuối kỳ. Population descriptor $\\mathsf P_t$ là mean flow trong nhánh kinh tế hoặc empirical-law embedding trong nhánh diagnostic. Reduced-form nghĩa price risk và liquidity được nén vào R, Q, A, C và evaluator.',
        },
        {
          type: 'formula',
          label: 'Population term và common economic evaluator',
          content: math`$$\begin{aligned}
F_{\rm pop}^{\rm econ}
=
\omega_pX_t^\top C\bar\alpha_t
+\omega_\tau\alpha_t^\top C\bar\alpha_t,
\\[10pt]
\widehat J_{\rm econ}
=
\sum_{k=0}^{N-1}\!\Delta t\,
\left(
\alpha_k^\top R\alpha_k
+X_k^\top QX_k
+\omega_pX_k^\top C\bar\alpha_k
+\omega_\tau\alpha_k^\top C\bar\alpha_k
\right)
+X_N^\top AX_N .
\end{aligned}$$`,
          note:
            'Đây là objective dùng để chấm chung các policy kinh tế. Hạng permanent crowding đo cost khi còn giữ inventory trong một dòng bán đồng hướng; hạng temporary crowding đo cost khi chính tốc độ giao dịch trùng với dòng bán của quần thể.',
        },
        {
          type: 'formula',
          label: 'Hamiltonian, FOC và control map',
          content: math`$$\begin{aligned}
H(t,x,\mu,p,a)
=f(t,x,\mu,a)+\langle b(t,x,\mu,a),p\rangle,
\qquad
\nabla_aH=2Ra-p=0,
\\[10pt]
a_{\rm raw}^\star=\frac12R^{-1}p,
\qquad
\alpha^\star=\mathcal C(a_{\rm raw}^\star,x,\Delta t).
\end{aligned}$$`,
          note:
            'Raw FOC đúng cho phần Hamiltonian có drift b=−a và control cost aᵀRa. Trong pipeline, temporary-crowding cost vẫn nằm trong training objective/evaluator nhưng raw map vẫn là $\\tfrac12R^{-1}p$ rồi mới qua constraint map. Vì vậy không nên gọi raw map này là closed-form argmin của Hamiltonian đã cộng đầy đủ temporary crowding.',
        },
        {
          type: 'comparison',
          columns: ['Control mode', 'Công thức', 'Ý nghĩa kinh tế'],
          rows: [
            ['Unconstrained', '$\\mathcal C(a,x)=a$', 'Cho phép mua lại/short inventory; thuận lợi cho benchmark giải tích'],
            ['Sell only', '$\\mathcal C(a,x)=\\max(a,0)$', 'Không cho buyback nhưng có thể bán quá inventory trong một step'],
            ['Bounded sell', '$0\\le\\alpha\\le x/\\Delta t$', 'Không âm và không oversell ở bước kế tiếp'],
            ['State floor', '$X_{k+1}\\leftarrow\\max(X_{k+1},0)$', 'Numerical guard, nhưng có thể làm dynamics không trơn'],
            ['Forced terminal', '$n_N\\leftarrow n_N+X_{N^-}$', 'Accounting/evaluation rule, không phải policy đã tự thanh lý'],
          ],
        },
        {
          type: 'formula',
          label: 'State–adjoint system tổng quát',
          content: math`$$\begin{cases}
\mathrm dX_t=b(t,X_t,\mu_t,\alpha_t)\,\mathrm dt
+\Sigma\,\mathrm dW_t+\Sigma_0\,\mathrm dW_t^0,\\
\mathrm dp_t=-\mathcal D_xH(t,X_t,\mu_t,p_t,\alpha_t)\,\mathrm dt
+q_t\,\mathrm dW_t+q_t^0\,\mathrm dW_t^0,\\
p_T=\mathcal D_xg(X_T,\mu_T),\\
\alpha_t=\arg\min_{a\in\mathcal A}H(t,X_t,\mu_t,p_t,a).
\end{cases}$$`,
          note:
            'Với terminal cost được dùng ở đây, $g(X_T)=X_T^\\top AX_T$ nên terminal target cụ thể là $p_T=2AX_T$. MFG dùng mean-flow consistency/fixed point; MFC dùng planner driver. q và q⁰ giữ private/common martingale channels.',
        },
        {
          type: 'code',
          label: 'Pseudocode · một time step Deep adjoint',
          content: code`# Nhánh kinh tế: population_feature = (mean_inventory, mean_alpha)
# Nhánh diagnostic: law_feature = deepsets(particles)
p = p0_net(x0, population_feature0)

for k in range(n_steps):
    q = q_net(t[k], x, population_feature)
    q0 = q0_net(t[k], x, population_feature)

    alpha_raw = 0.5 * torch.linalg.solve(R, p.T).T
    alpha = control_map(alpha_raw, inventory=x, dt=dt)

    p = p - implemented_driver_gradient(
        t[k], x, alpha, population_feature
    ) * dt + q * dW[k] + q0 * dW0[k]

    x = x - alpha * dt \
          + sigma_id @ dW[k] + sigma0 @ dW0[k]

terminal_target = 2.0 * x @ A
loss = ((p - terminal_target) ** 2).sum(-1).mean()`,
        },
        {
          type: 'comparison',
          columns: ['Nhánh khái niệm', 'Giữ từ mô hình mẹ', 'Bật/thay thành phần nào?'],
          rows: [
            ['Clean LQ', 'Quadratic cost, linear dynamics', 'Tắt law/constraint phức tạp; so Riccati'],
            ['AC diagonal-impact', 'Inventory, impact, risk', 'Scalar path từng tài sản; full covariance khi chấm risk'],
            ['Mean-control bridge', 'State–adjoint core', 'Thêm mean control và outer relaxation đơn giản'],
            ['Empirical-law diagnostic', 'FBSDE + particles', 'Deep Sets, private/common noise, p₀, q và q⁰'],
            ['Economic MFG', 'Best-response solver', 'Mean-control flow ngoại sinh bên trong; fixed point bên ngoài'],
            ['Economic MFC', 'Population rollout', 'Mean inventory/control và planner crowding gradient'],
            ['Common evaluator', 'Policy từ MFG, MFC và AC', 'Cùng crowding objective, terminal rule và noise protocol'],
          ],
        },
        {
          type: 'steps',
          title: 'Tách tham số kinh tế khỏi hyperparameter',
          items: [
            'Structural/economic: R, Q, A, impact matrix, risk aversion, horizon, control constraints.',
            'Stochastic: Σid, Σ0, initial law, Brownian dimension và correlation structure.',
            'Game/control: interaction function Ψ, MFG consistency map, MFC law derivative.',
            'Discretization: Δt, số particles, numerical scheme và terminal treatment.',
            'Learning: network depth/width, activation, optimizer, learning rate, clipping và regularization weights.',
            'Evaluation: seed registry, held-out paths, same-noise protocol, metrics và confidence intervals.',
          ],
        },
        {
          type: 'insight',
          tone: 'teal',
          title: 'Model gốc là hệ phương trình và interface, không phải tên một class',
          content:
            'Hai class có thể không kế thừa nhau trong Python nhưng vẫn là hai specialization của cùng dynamics–objective–adjoint interface. Ngược lại, dùng chung một neural module không chứng minh hai nhánh đang giải cùng bài toán kinh tế. Source of truth luôn là phương trình, cost decomposition và evaluator đi kèm.',
        },
        {
          type: 'insight',
          tone: 'rose',
          title: 'Reduced-form execution không phải price-process hoàn chỉnh',
          content:
            'Nếu state chỉ là inventory và covariance đi vào Q/evaluator, mô hình không trực tiếp dự báo midprice, spread động, queue position hay transient resilience. Đây là lựa chọn phạm vi hợp lý cho việc nghiên cứu execution control, nhưng phải nói rõ khi diễn giải kết quả.',
        },
      ],
    },
    {
      heading: '23. Thiết kế benchmark như scientific unit test',
      eyebrow: 'Evidence architecture',
      summary:
        'Benchmark tốt không chỉ xếp hạng model; nó cô lập một nghi ngờ. Chuỗi kiểm chứng nên đi từ bài có nghiệm biết đến interaction phức tạp, để khi thất bại còn xác định được lỗi nằm ở đại số, stochastic rollout, law encoder hay evaluator.',
      blocks: [
        {
          type: 'comparison',
          columns: ['Tầng kiểm chứng', 'Reference/đối chứng', 'Nghi ngờ cần loại', 'Metric chính'],
          rows: [
            ['LQ/Riccati', 'ODE ma trận độc lập neural', 'Sai dấu, factor 2, terminal map, Δt', 'Relative L2 control, costate và terminal residual'],
            ['AC specialization', 'Scalar AC + diagonal-impact evaluator', 'Sai τ, η̃, covariance conversion hoặc completion', 'α/X path, cost components, AC self-check'],
            ['Mean-field bridge', 'Zero/small interaction limits', 'Outer update không ổn hoặc mean feedback sai', 'Fixed-point residual và limiting behavior'],
            ['Empirical-law/noise diagnostic', 'Noise-off, moment encoder, particle refinement', 'q/q⁰, set symmetry hoặc law sampling sai', 'Law features, q norms, N sensitivity'],
            ['Economic MFG/MFC', 'Các policy qua cùng moment-closure evaluator', 'False dominance do objective/noise khác', 'Objective gap, decomposition, fitted PoA, multi-seed'],
          ],
        },
        {
          type: 'paragraph',
          content:
            'AC có ít nhất ba vai trò khác nhau. Thứ nhất, nó là nghiệm tham chiếu trong môi trường cổ điển, nơi một solver mới phải xấp xỉ chứ không nên “đánh bại” AC nếu objective và feasible set thật sự giống hệt. Thứ hai, nó là initializer hoặc structured prior cho một bài mean-field khó hơn. Thứ ba, nó là economic baseline được chấm lại dưới objective mở rộng. Trộn ba vai trò này sẽ dẫn đến kết luận sai.',
        },
        {
          type: 'formula',
          label: 'Bộ metric tối thiểu cho state–control–boundary',
          content: math`$$\begin{aligned}
e_\alpha^{\rm rel}
=\frac{\|\alpha-\alpha^{\rm ref}\|_2}
{\max(\|\alpha^{\rm ref}\|_2,\varepsilon)},
\qquad
e_X^{\rm rel}
=\frac{\|X-X^{\rm ref}\|_2}
{\max(\|X^{\rm ref}\|_2,\varepsilon)},
\\[10pt]
e_T
=
\left(\mathbb E\|p_T-\mathcal D_xg(X_T,\mu_T)\|_2^2\right)^{1/2},
\qquad
r_{\rm fp}
=\|\mu-\Phi(\mu)\|.
\end{aligned}$$`,
          note:
            'Không metric đơn nào đủ: control đúng shape có thể sai completion; terminal residual thấp có thể đi cùng objective xấu; fixed-point tốt không nói equilibrium hiệu quả xã hội.',
        },
        {
          type: 'formula',
          label: 'Common evaluator cho so sánh kinh tế',
          content: math`$$\widehat J_m
=
\frac1M\sum_{r=1}^{M}
C\!\left(
\alpha_m^{(r)},X_m^{(r)},\bar\alpha_{\rm env}^{(r)};
\omega_r
\right),
\qquad
\omega_r\text{ shared by every method }m.$$`,
          note:
            'Common random numbers giảm variance của chênh lệch pairwise. Cần cùng initial states, common/private shocks, horizon, terminal rule, normalization và cost decomposition.',
        },
        {
          type: 'comparison',
          columns: ['Chế độ đánh giá', 'Làm gì?', 'Dùng để kết luận'],
          rows: [
            ['Native', 'Mỗi policy tạo population flow của chính nó', 'Kết quả kinh tế chính trong môi trường endogenous'],
            ['Same-flow', 'Chấm nhiều controls dưới cùng một mean flow', 'Tách chất lượng control khỏi khác biệt môi trường'],
            ['Forced terminal', 'Cộng inventory còn lại vào trade cuối và ghi cost', 'Robustness/accounting; không che terminal failure'],
            ['Pre-forced terminal', 'Đo inventory ngay trước khi cưỡng bức', 'Khả năng policy tự hoàn thành'],
            ['Noise matched', 'Dùng cùng Brownian draws giữa methods', 'So sánh pairwise ít nhiễu hơn'],
            ['Held-out', 'Tách paths/seeds train và evaluate', 'Generalization Monte Carlo, tránh chọn seed đẹp'],
          ],
        },
        {
          type: 'formula',
          label: 'PoA chuẩn và fitted ratio',
          content: math`$$\operatorname{PoA}
=
\frac{\sup_{\alpha\in\mathcal E_{\rm MFG}}J_{\rm social}(\alpha)}
{\inf_{\beta\in\mathcal A_{\rm planner}}J_{\rm social}(\beta)}
\ge1,
\qquad
\widehat{\operatorname{PoA}}
=
\frac{\widehat J_{\rm MFG}}{\widehat J_{\rm MFC}}.$$`,
          note:
            'PoA lý thuyết dùng worst equilibrium và exact planner optimum. Ratio từ hai solver fitted chỉ là diagnostic; nhỏ hơn 1 báo cần audit approximation, seed, regularization, fixed-point và evaluator.',
        },
        {
          type: 'comparison',
          columns: ['Ablation', 'Câu hỏi nó trả lời'],
          rows: [
            ['Tắt law encoder ở diagnostic branch', 'Representation empirical-law có thực sự dùng thông tin ngoài mean/moments?'],
            ['Tắt private noise', 'q head có đang học idiosyncratic sensitivity?'],
            ['Tắt common noise', 'q⁰ và conditional law có vai trò gì?'],
            ['Tắt crowding term ở economic branch', 'Chênh lệch đến từ strategic interaction hay optimizer?'],
            ['Tắt auxiliary losses', 'Kết quả có phụ thuộc regularization hơn objective gốc?'],
            ['Đổi N và Δt', 'Particle error và time discretization có ổn định?'],
            ['Đổi seed/initialization', 'Optimization variance lớn đến đâu?'],
            ['Riccati/AC không đưa vào loss', 'Reference có thật sự độc lập với solver?'],
          ],
        },
        {
          type: 'steps',
          title: 'Điều kiện để một bảng benchmark có sức thuyết phục',
          items: [
            'Khóa trước objective, feasible set, metric chính và threshold; không chọn sau khi xem kết quả.',
            'Báo cả total cost lẫn execution, inventory risk, terminal và crowding components.',
            'Báo mean, standard deviation, số seed và pairwise differences; tránh chỉ một seed.',
            'Lưu best checkpoint theo validation rule, đồng thời phân biệt best train với last train.',
            'Ghi dimension, time steps, particles, network size, optimizer budget, hardware và runtime.',
            'Không dùng reference analytical trong training loss nếu mục tiêu là kiểm numerical recovery độc lập.',
            'Nếu tầng đơn giản thất bại, dừng claim ở tầng phức tạp thay vì lấy loss thấp làm bằng chứng thay thế.',
          ],
        },
        {
          type: 'code',
          label: 'Python · paired benchmark summary',
          content: code`paired = (
    results.pivot_table(
        index=["seed", "dimension"],
        columns="method",
        values="objective",
    )
    .dropna()
)
paired["MFG_minus_MFC"] = paired["MFG"] - paired["MFC"]
paired["MFG_minus_AC"] = paired["MFG"] - paired["AC"]

summary = paired.agg(["mean", "std", "count"]).T
summary["se"] = summary["std"] / np.sqrt(summary["count"])
summary["ci95_halfwidth"] = 1.96 * summary["se"]

# Luôn giữ terminal inventory trước forced liquidation.
assert "terminal_inventory_before_forced" in results.columns`,
        },
        {
          type: 'insight',
          tone: 'teal',
          title: 'Benchmark là kiến trúc bằng chứng',
          content:
            'Một hierarchy mạnh cho biết chính xác mỗi tầng cho phép nói gì và chưa cho phép nói gì. Kết quả economic tốt không tự sửa một FBSDE sai; ngược lại, khớp Riccati không tự chứng minh giá trị kinh tế trong crowding environment.',
        },
      ],
    },
    {
      heading: '24. Những cầu nối nâng cao và giới hạn mô hình',
      eyebrow: 'Beyond the core',
      summary:
        'FBSDE chỉ là một mặt của hệ sinh thái stochastic control. Hiểu các cầu nối sang density PDE, value PDE, master equation và market microstructure giúp biết khi nào mô hình hiện tại đủ dùng và khi nào cần mở rộng.',
      blocks: [
        {
          type: 'formula',
          label: 'Fokker–Planck: dynamics của density',
          content: math`$$\partial_t m_t(x)
=
-\nabla_x\!\cdot\!\big(b(t,x,\alpha_t,m_t)m_t(x)\big)
+\frac12\sum_{i,j}
\partial_{x_ix_j}^2
\left(
[\sigma\sigma^\top]_{ij}m_t(x)
\right).$$`,
          note:
            'SDE theo dõi một path; Fokker–Planck theo dõi distribution/density của cả population. Trong MFG không common noise, HJB và Fokker–Planck thường tạo một hệ backward–forward PDE.',
        },
        {
          type: 'formula',
          label: 'HJB, Feynman–Kac và decoupling field',
          content: math`$$\begin{aligned}
0=\partial_tV+\inf_a
\left\{
f+\nabla V^\top b
+\tfrac12\operatorname{Tr}(\sigma\sigma^\top\nabla^2V)
\right\},
\qquad
V(T,x)=g(x),
\\[10pt]
p_t\approx\nabla_xV(t,X_t),\qquad
q_t\approx\nabla_x^2V(t,X_t)\sigma
\quad\text{under a smooth Markov setting}.
\end{aligned}$$`,
          note:
            'HJB nhìn toàn state space; FBSDE nhìn sampled trajectories. Feynman–Kac nối PDE bán tuyến tính với BSDE khi các giả định regularity và integrability thỏa.',
        },
        {
          type: 'comparison',
          columns: ['Đối tượng', 'Không gian đầu vào', 'Khó khăn số'],
          rows: [
            ['Value function $V(t,x)$', 'Thời gian × state', 'Curse of dimensionality theo d'],
            ['Decoupling field $u(t,x)$', 'State → adjoint/value', 'Hàm cao chiều nhưng có thể học từ paths'],
            ['MFG HJB–FP system', 'State + density flow', 'Forward–backward coupling'],
            ['Master equation $U(t,x,\\mu)$', 'State + probability measure', 'Đạo hàm theo law, vô hạn chiều'],
            ['Particle FBSDE', 'N particles × d', 'Sampling/interaction cost tăng theo N và d'],
          ],
        },
        {
          type: 'formula',
          label: 'Error budget theo các giới hạn',
          content: math`$$\mathfrak E
\lesssim
C_{\rm time}\Delta t^{\,r}
+C_{\rm particle}\,\varepsilon_N
+C_{\rm net}\,\varepsilon_{\rm approx}
+C_{\rm opt}\,\varepsilon_{\rm train}
+C_{\rm fp}\,r_{\rm fp}
+C_{\rm MC}M^{-1/2}.$$`,
          note:
            'Đây là sơ đồ tư duy, không phải bound phổ quát. Mỗi hạng cần assumptions riêng: regularity, moment bounds, stability/monotonicity, network capacity và optimizer.',
        },
        {
          type: 'formula',
          label: 'Banach fixed point và outer loop MFG',
          content: math`$$\Phi:\mu\longmapsto
\mathcal L\!\left(X^{\operatorname{BR}(\mu)}\right),
\qquad
\|\Phi(\mu)-\Phi(\nu)\|_{\mathcal B}
\le \rho\,\|\mu-\nu\|_{\mathcal B},
\qquad 0\le\rho<1.$$`,
          note:
            'Nếu best-response law map Φ là contraction trong một norm thích hợp, Banach fixed-point theorem cho fixed point duy nhất và iteration hội tụ. Trong thực nghiệm, relaxation có thể giúp ổn định nhưng không tự chứng minh ρ<1.',
        },
        {
          type: 'comparison',
          columns: ['Điều kiện lý thuyết', 'Nó bảo vệ điều gì?'],
          rows: [
            ['Lipschitz/linear growth', 'SDE/BSDE có nghiệm ổn định và moment hữu hạn'],
            ['Convexity theo control', 'FOC đủ mạnh hơn và optimizer ít mơ hồ'],
            ['$R\\succ0$', 'Temporary/control cost coercive; raw control map xác định'],
            ['$Q,A\\succeq0$', 'Inventory penalties không tạo reward vô lý theo hướng âm'],
            ['Lasry–Lions monotonicity', 'Hỗ trợ uniqueness/stability cho mean-field coupling'],
            ['Small horizon/coupling hoặc Riccati solvability', 'Giảm nguy cơ FBSDE fully coupled mất ổn định'],
            ['Uniform moment bounds', 'Particle approximation và law costs không bùng nổ'],
          ],
        },
        {
          type: 'comparison',
          columns: ['Mở rộng execution', 'Thêm điều gì?', 'Khi nào cần?'],
          rows: [
            ['TWAP/VWAP', 'Time/volume benchmark', 'Baseline vận hành đơn giản và sanity limit risk-neutral'],
            ['Transient impact', 'Impact decay/resilience state', 'Khi impact không mất ngay và không tồn tại vĩnh viễn'],
            ['Obizhaeva–Wang style', 'Order-book resilience', 'Khi muốn nối optimal execution với liquidity recovery'],
            ['Signals/order flow', 'Alpha state và market flow', 'Khi timing dùng forecast ngắn hạn'],
            ['Limit orders', 'Fill probability và queue state', 'Khi execution venue/microstructure quan trọng'],
            ['Price limits', 'State/control constraints phi tuyến', 'Thị trường có biên dao động và regime effects'],
            ['Transaction-cost nonlinearity', 'Power-law hoặc concave/convex impact', 'Khi linear impact không phù hợp dữ liệu'],
          ],
        },
        {
          type: 'paragraph',
          content:
            'Một blog nền tảng nên tách hai câu hỏi. Câu hỏi thứ nhất là “solver có giải đúng mô hình đã viết không?” — trả lời bằng Riccati, AC, residual, refinement và unit tests. Câu hỏi thứ hai là “mô hình có mô tả dữ liệu/thị trường đủ tốt không?” — cần calibration ngoài mẫu, microstructure diagnostics, stability theo regime và đánh giá chi phí thực. Thành công ở câu hỏi đầu là điều kiện cần, không phải câu trả lời cho câu hỏi sau.',
        },
        {
          type: 'steps',
          title: 'Lộ trình học sâu sau chuyên khảo này',
          items: [
            'Đọc stochastic calculus theo hướng L²: martingale representation, conditional expectation và Itô isometry.',
            'Học HJB–Fokker–Planck song song với stochastic maximum principle để thấy hai representation.',
            'Học Wasserstein space và Lions derivative trước khi đọc master equation/full-law MFC.',
            'Tự triển khai LQ/Riccati và AC rời rạc trước khi dùng neural solver.',
            'Thực hiện particle-refinement, time-refinement, law ablation và common-noise tests.',
            'Mở rộng execution lần lượt: transient impact, signals, constraints và order-book state.',
          ],
        },
        {
          type: 'insight',
          tone: 'amber',
          title: 'Hiện đại không đồng nghĩa phức tạp tối đa',
          content:
            'Một mô hình nhỏ có benchmark độc lập, đơn vị nhất quán và phạm vi rõ thường đáng tin hơn một kiến trúc Full-Law rất lớn nhưng không có refinement test. Chỉ thêm state/law feature khi cơ chế kinh tế và bằng chứng thực nghiệm yêu cầu.',
        },
      ],
    },
    {
      heading: '25. Tài liệu tham khảo cốt lõi',
      eyebrow: 'Nguồn học thuật',
      summary:
        'Các nguồn được chọn để người đọc có thể đi từ original papers đến tài liệu tổng quan và kiểm tra từng lớp lập luận.',
      blocks: [
        {
          type: 'source-list',
          title: 'Primary references và tài liệu nền',
          items: [
            {
              title: 'Han, Jentzen & E · Solving High-Dimensional PDEs Using Deep Learning',
              note: 'Bài báo PNAS đặt nền tảng cho Deep BSDE approach đối với PDE/BSDE số chiều cao.',
              href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6112690/',
            },
            {
              title: 'Yong & Zhou · Stochastic Controls: Hamiltonian Systems and HJB Equations',
              note: 'Tài liệu hệ thống về Pontryagin stochastic maximum principle, adjoint systems và liên hệ với HJB.',
              href: 'https://link.springer.com/book/10.1007/978-1-4612-1466-3',
            },
            {
              title: 'Peng · A General Stochastic Maximum Principle for Optimal Control Problems',
              note: 'Kết quả nền tảng cho stochastic maximum principle trong setting nonlinear tổng quát.',
              href: 'https://epubs.siam.org/doi/10.1137/0328054',
            },
            {
              title: 'Almgren & Chriss · Optimal Execution of Portfolio Transactions',
              note: 'Mô hình rời rạc, expected shortfall, variance và efficient frontier giữa impact với volatility risk.',
              href: 'https://doi.org/10.21314/JOR.2001.041',
            },
            {
              title: 'Romero & Bautista · Exact Solutions for Optimal Execution and Riccati Equation',
              note: 'Cầu nối giữa nghiệm Almgren–Chriss, phương trình ma trận và Riccati.',
              href: 'https://arxiv.org/abs/1601.07961',
            },
            {
              title: 'Cardaliaguet & Lehalle · Mean Field Game of Controls and Trade Crowding',
              note: 'Đưa optimal liquidation vào extended MFG với interaction qua controls và crowding.',
              href: 'https://arxiv.org/abs/1610.09904',
            },
            {
              title: 'Bensoussan et al. · Linear–Quadratic Mean Field Games',
              note: 'Adjoint approach, Riccati structure, Banach fixed point và điều kiện tồn tại–duy nhất cho LQ-MFG.',
              href: 'https://arxiv.org/abs/1404.5741',
            },
            {
              title: 'Carmona & Laurière · Deep Learning for MFG and MFC with Applications to Finance',
              note: 'Tổng quan direct, Deep BSDE và PDE-based neural methods cho MFG/MFC.',
              href: 'https://arxiv.org/abs/2107.04568',
            },
            {
              title: 'Carmona, Graves & Tan · Price of Anarchy for Mean Field Games',
              note: 'Định nghĩa PoA là worst equilibrium social cost trên central-planner optimum.',
              href: 'https://arxiv.org/abs/1802.04644',
            },
            {
              title: 'Carmona & Laurière · Convergence Analysis for Finite-Horizon MFC/MFG',
              note: 'Phân tích phương pháp machine learning cho McKean–Vlasov control và FBSDE finite horizon.',
              href: 'https://arxiv.org/abs/1908.01613',
            },
            {
              title: 'Carmona & Delarue · Controlled McKean–Vlasov Dynamics',
              note: 'Stochastic maximum principle, FBSDE mean-field và điều kiện đủ cho optimal control.',
              href: 'https://arxiv.org/abs/1303.5835',
            },
            {
              title: 'Zaheer et al. · Deep Sets',
              note: 'Cấu trúc neural permutation-invariant dùng để mã hóa empirical particle clouds.',
              href: 'https://arxiv.org/abs/1703.06114',
            },
            {
              title: 'MIT OpenCourseWare · Stochastic Calculus',
              note: 'Brownian motion, Itô calculus và các building blocks của continuous-time finance.',
              href: 'https://ocw.mit.edu/courses/15-450-analytics-of-finance-fall-2010/511a32446b77d2566dae5d97253e83c9_MIT15_450F10_rec03.pdf',
            },
            {
              title: 'Aalto University · Probability Theory',
              note: 'Không gian L², conditional expectation như phép chiếu trực giao và Pythagorean identity.',
              href: 'https://mooc.math.aalto.fi/~kkytola/files_KK/lectures_files_KK/ProbaTh-2019.pdf',
            },
            {
              title: 'Lasry & Lions · Mean Field Games',
              note: 'Nền tảng giải tích của hệ mean-field game và liên hệ với large-population strategic interaction.',
              href: 'https://doi.org/10.1007/s11537-007-0657-8',
            },
          ],
        },
        {
          type: 'steps',
          title: 'Lộ trình đọc tiếp theo năng lực',
          items: [
            'Mới bắt đầu: Brownian → Itô → SDE → LQ → Almgren–Chriss.',
            'Đã biết stochastic control: Hamiltonian → adjoint BSDE → FBSDE → Riccati benchmark.',
            'Muốn học mean field: empirical law → McKean–Vlasov → MFG fixed point → MFC law derivative → PoA.',
            'Muốn triển khai: Euler–Maruyama → Deep BSDE → law encoder → benchmark ladder → reproducibility.',
          ],
        },
        {
          type: 'paragraph',
          content:
            'Kết luận: Deep BSDE có giá trị khi được đặt đúng vị trí — một solver xác suất cho bài toán boundary-value số chiều cao, được xây trên Itô calculus và stochastic control, mở rộng bằng mean-field structure, rồi kiểm chứng ngược bằng LQ/Riccati và Almgren–Chriss. Tính chuyên nghiệp đến từ sự nhất quán giữa phương trình, code, evaluator và phạm vi kết luận; neural network chỉ là một mắt xích trong chuỗi đó.',
        },
      ],
    },
  ],
};
