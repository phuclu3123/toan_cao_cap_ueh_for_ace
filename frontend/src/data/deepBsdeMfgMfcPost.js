const math = String.raw;
const code = String.raw;

export const deepBsdeMfgMfcPost = {
  slug: 'deep-bsde-fbsde-mfg-mfc-quant-finance',
  title: 'Deep BSDE, FBSDE và Mean Field: nền tảng xây dựng mô hình Quant Finance số chiều cao',
  category: 'Chuyên khảo · Stochastic Control',
  date: '23/07/2026',
  updatedAt: 'Đã đối chiếu nguồn học thuật ngày 23/07/2026',
  author: 'Lữ Võ Hoàng Phúc (K50 UEH)',
  readingTime: '68 phút đọc · lý thuyết, mô hình và thuật toán',
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
    { value: '20', label: 'section từ nhập môn đến triển khai' },
    { value: '05', label: 'sơ đồ kiến trúc kỹ thuật' },
    { value: '04', label: 'tầng benchmark bắt buộc' },
  ],
  toc: [
    'Dẫn nhập: Deep BSDE đang giải bài toán gì?',
    '1. Bản đồ khái niệm: từ xác suất đến chính sách điều khiển',
    '2. Không gian xác suất, filtration và tính adapted',
    '3. Brownian motion và vì sao nhiễu có căn bậc hai thời gian',
    '4. Công thức Itô: chain rule của thế giới ngẫu nhiên',
    '5. SDE, BSDE và ý nghĩa của biến martingale Z',
    '6. FBSDE: vì sao phương trình tiến và lùi phải giải đồng thời?',
    '7. Stochastic maximum principle và Hamiltonian',
    '8. Linear–Quadratic control và phương trình Riccati',
    '9. Almgren–Chriss: benchmark kinh điển của optimal execution',
    '10. Từ nhiều agent đến McKean–Vlasov và empirical law',
    '11. Mean Field Game: cân bằng của các agent chiến lược',
    '12. Mean Field Control: social planner tối ưu toàn quần thể',
    '13. MFG, MFC và Price of Anarchy',
    '14. Vì sao dùng Deep BSDE thay vì lưới PDE?',
    '15. ANN trong Deep BSDE học đối tượng nào?',
    '16. Thuật toán rời rạc hóa, rollout và hàm loss',
    '17. Xây dựng mô hình execution nhiều tài sản có mean field',
    '18. Benchmark, chẩn đoán và kỷ luật triển khai',
    '19. Tài liệu tham khảo cốt lõi',
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
          content: math`$$
\underbrace{\mathrm dX_t=b(t,X_t,\alpha_t,\mu_t)\,\mathrm dt+\sigma(t,X_t,\mu_t)\,\mathrm dW_t}_{\text{state dynamics}}
\quad+\quad
\underbrace{J(\alpha)=\mathbb E\!\left[\int_0^T f(t,X_t,\alpha_t,\mu_t)\,\mathrm dt+g(X_T,\mu_T)\right]}_{\text{objective}}
\quad+\quad
\underbrace{\alpha_t\in\mathcal A}_{\text{admissible policy}}
$$`,
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
          content: math`$$
\text{Stochastic control}
\longrightarrow
\begin{cases}
\text{Dynamic programming}\longrightarrow\text{HJB PDE},\\
\text{Maximum principle}\longrightarrow\text{FBSDE}.
\end{cases}
$$`,
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
          content: math`$$\alpha_t\ \text{là }\mathcal F_t\text{-measurable cho mọi }t$$`,
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
          content: math`$$
\mathrm dX_t=b_t\,\mathrm dt+\sigma_t\,\mathrm dW_t
\quad\Longrightarrow\quad
\mathrm df(t,X_t)=
\left(f_t+b_tf_x+\frac12\sigma_t^2f_{xx}\right)\mathrm dt
+\sigma_tf_x\,\mathrm dW_t
$$`,
          note:
            'Hạng ½σ²fxx không xuất hiện trong chain rule tất định.',
        },
        {
          type: 'formula',
          label: 'Itô formula nhiều chiều',
          content: math`$$
\mathrm df(t,X_t)=
\left[
\partial_tf+\nabla f^\top b
+\frac12\operatorname{Tr}\!\left(\sigma\sigma^\top\nabla_x^2f\right)
\right]\mathrm dt
+\nabla f^\top\sigma\,\mathrm dW_t
$$`,
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
          content: math`$$
\begin{aligned}
\mathrm dX_t&=b(t,X_t,Y_t,Z_t)\,\mathrm dt+\sigma(t,X_t,Y_t)\,\mathrm dW_t,\qquad X_0=x_0,\\
\mathrm dY_t&=-f(t,X_t,Y_t,Z_t)\,\mathrm dt+Z_t\,\mathrm dW_t,\qquad Y_T=g(X_T).
\end{aligned}
$$`,
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
      heading: '7. Stochastic maximum principle và Hamiltonian',
      eyebrow: 'Điều kiện tối ưu',
      summary:
        'Maximum principle đưa gradient của objective vào một adjoint BSDE và biến tối ưu quỹ đạo thành điều kiện tối ưu cục bộ của Hamiltonian.',
      blocks: [
        {
          type: 'formula',
          label: 'Bài toán control',
          content: math`$$
\inf_{\alpha\in\mathcal A}
J(\alpha)
=
\mathbb E\!\left[
\int_0^T \ell(t,X_t,\alpha_t)\,\mathrm dt
+g(X_T)
\right],
\qquad
\mathrm dX_t=b(t,X_t,\alpha_t)\,\mathrm dt+\sigma(t,X_t,\alpha_t)\,\mathrm dW_t
$$`,
          note:
            'Ta viết bài toán minimization; với maximization, dấu và điều kiện Hamiltonian đổi tương ứng.',
        },
        {
          type: 'formula',
          label: 'Hamiltonian',
          content: math`$$H(t,x,\alpha,p,q)=\ell(t,x,\alpha)+p^\top b(t,x,\alpha)+\operatorname{Tr}\!\left(q^\top\sigma(t,x,\alpha)\right)$$`,
          note:
            'Convention có thể khác giữa tài liệu; phải giữ nhất quán dấu của adjoint equation và FOC.',
        },
        {
          type: 'formula',
          label: 'Adjoint BSDE và terminal condition',
          content: math`$$
\mathrm dp_t=-\nabla_xH(t,X_t,\alpha_t,p_t,q_t)\,\mathrm dt+q_t\,\mathrm dW_t,
\qquad
p_T=\nabla_xg(X_T)
$$`,
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
\mathrm dX_t=(BX_t+D\alpha_t)\,\mathrm dt+\Sigma\,\mathrm dW_t,
\qquad
J(\alpha)=\mathbb E\!\left[
\int_0^T(X_t^\top QX_t+\alpha_t^\top R\alpha_t)\,\mathrm dt
+X_T^\top AX_T
\right]
$$`,
          note:
            'Thường yêu cầu R≻0, Q⪰0 và A⪰0 để bài toán lồi theo control/state cost.',
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
-\dot P_t
=
B^\top P_t+P_tB
-P_tDR^{-1}D^\top P_t
+Q,
\qquad
P_T=A
$$`,
          note:
            'Công thức ứng với objective không có hệ số 1/2 và control law bên dưới; convention khác có thể đổi hệ số.',
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
        'Almgren–Chriss biến bài toán thanh lý thành trade-off minh bạch giữa chi phí giao dịch và rủi ro giữ vị thế.',
      blocks: [
        {
          type: 'paragraph',
          content:
            'Một nhà giao dịch cần thanh lý inventory $X_0$ trong horizon $[0,T]$. Bán quá nhanh làm temporary impact cao; bán quá chậm giữ exposure với price volatility lâu hơn. Almgren–Chriss xây efficient frontier giữa expected execution cost và variance của execution cost.',
        },
        {
          type: 'formula',
          label: 'Continuous-time LQ approximation',
          content: math`$$
\min_{\alpha}
\int_0^T\left(\eta\alpha_t^2+\lambda\sigma^2X_t^2\right)\mathrm dt,
\qquad
\dot X_t=-\alpha_t,\quad X_0=x_0,\quad X_T=0
$$`,
          note:
            'η là temporary-impact scale; λ là risk aversion; σ là price volatility.',
        },
        {
          type: 'formula',
          label: 'Quỹ đạo thanh lý dạng hyperbolic',
          content: math`$$
\kappa=\sqrt{\frac{\lambda\sigma^2}{\eta}},
\qquad
X_t^\star=x_0\frac{\sinh(\kappa(T-t))}{\sinh(\kappa T)},
\qquad
\alpha_t^\star=-\dot X_t^\star
$$`,
          note:
            'Đây là continuous simplification; discrete AC có temporary/permanent impact và hệ số hiệu chỉnh riêng.',
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
      heading: '10. Từ nhiều agent đến McKean–Vlasov và empirical law',
      eyebrow: 'Tương tác quần thể',
      summary:
        'Khi mỗi agent chịu ảnh hưởng của phân phối trạng thái hoặc hành động của cả quần thể, dynamics trở thành McKean–Vlasov và state space mở rộng sang không gian xác suất.',
      blocks: [
        {
          type: 'formula',
          label: 'Hệ N agent tương tác',
          content: math`$$
\mathrm dX_t^{i,N}
=
b\!\left(t,X_t^{i,N},\alpha_t^{i,N},\mu_t^N\right)\mathrm dt
+\sigma\,\mathrm dW_t^i
+\sigma_0\,\mathrm dW_t^0,
\qquad
\mu_t^N=\frac1N\sum_{j=1}^{N}\delta_{X_t^{j,N}}
$$`,
          note:
            'μtN là empirical law; Wi là private noise; W0 là common noise.',
        },
        {
          type: 'formula',
          label: 'Giới hạn McKean–Vlasov đại diện',
          content: math`$$
\mathrm dX_t
=
b\!\left(t,X_t,\alpha_t,\mathcal L(X_t\mid\mathcal F_t^0)\right)\mathrm dt
+\sigma\,\mathrm dW_t
+\sigma_0\,\mathrm dW_t^0
$$`,
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
          content: math`$$
\operatorname{Cov}(\mathrm dX_t^i\mid\mathcal F_t)
=
(\Sigma_{\mathrm{id}}\Sigma_{\mathrm{id}}^\top+\Sigma_0\Sigma_0^\top)\mathrm dt,
\qquad
\operatorname{Cov}(\mathrm dX_t^i,\mathrm dX_t^j\mid\mathcal F_t)
=
\Sigma_0\Sigma_0^\top\mathrm dt
$$`,
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
          content: math`$$
\alpha^{m,\star}
\in
\arg\min_{\alpha\in\mathcal A}
\mathbb E\!\left[
\int_0^T f(t,X_t,\alpha_t,m_t)\,\mathrm dt
+g(X_T,m_T)
\right]
$$`,
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
          content: math`$$
\inf_{\alpha\in\mathcal A}
\mathbb E\!\left[
\int_0^T f\!\left(t,X_t,\alpha_t,\mathcal L(X_t)\right)\mathrm dt
+g\!\left(X_T,\mathcal L(X_T)\right)
\right]
$$`,
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
          content: math`$$
\frac{\mathrm d}{\mathrm d\varepsilon}J(\alpha+\varepsilon\beta)\Big|_{\varepsilon=0}
=
\underbrace{\text{direct state/control effect}}_{\text{ảnh hưởng lên agent đại diện}}
+
\underbrace{\text{law effect}}_{\text{ảnh hưởng lên toàn population}}
$$`,
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
          content: math`$$
\operatorname{PoA}
=
\frac{
\displaystyle\sup_{\alpha\in\mathcal E_{\mathrm{MFG}}}J_{\mathrm{social}}(\alpha)
}{
\displaystyle\inf_{\alpha\in\mathcal A}J_{\mathrm{social}}(\alpha)
}
=
\frac{J_{\mathrm{social}}^{\mathrm{worst\ MFG}}}{J_{\mathrm{social}}^{\mathrm{MFC}}}
$$`,
          note:
            'Nếu equilibrium duy nhất, tử số là social cost của equilibrium đó.',
        },
        {
          type: 'formula',
          label: 'Diễn giải',
          content: math`$$\operatorname{PoA}=1\ \Longrightarrow\ \text{equilibrium hiệu quả xã hội},\qquad \operatorname{PoA}>1\ \Longrightarrow\ \text{có inefficiency do phi hợp tác}$$`,
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
            ['DGM / PINN', 'Tối ưu PDE residual liên tục', 'Cân bằng nhiều residual/boundary losses'],
            ['Direct policy optimization', 'Đơn giản khi objective differentiable', 'Có thể bỏ cấu trúc adjoint'],
            ['Reinforcement learning', 'Linh hoạt với môi trường/simulator', 'Sample cost và variance cao, audit khó hơn'],
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
          content: math`$$
\mathrm dX_t^i
=
-\alpha_t^i\,\mathrm dt
+\Sigma_{\mathrm{id}}\,\mathrm dW_t^i
+\Sigma_0\,\mathrm dW_t^0
$$`,
          note:
            'X và α thuộc Rᵈ; diffusion matrices có thể mang covariance geometry giữa các tài sản.',
        },
        {
          type: 'formula',
          label: 'Một objective có control, risk và crowding',
          content: math`$$
J^i(\alpha^i;\mu)
=
\mathbb E\!\left[
\int_0^T
\left(
(\alpha_t^i)^\top R\alpha_t^i
+(X_t^i)^\top QX_t^i
+\Psi(X_t^i,\alpha_t^i,\mu_t)
\right)\mathrm dt
+(X_T^i)^\top AX_T^i
\right]
$$`,
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
          title: 'Bốn tầng benchmark khuyến nghị',
          items: [
            'Tầng 1 — LQ/Riccati: kiểm dấu, terminal adjoint, feedback control và matrix coupling.',
            'Tầng 2 — Almgren–Chriss: kiểm liquidation geometry, inventory path và impact–risk trade-off.',
            'Tầng 3 — Stochastic mean field: bật private/common noise, empirical law và kiểm fixed-point/path stability.',
            'Tầng 4 — Economic comparison: so MFG, MFC và baseline dưới cùng evaluator, objective và noise paths.',
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
          content: math`$$
\text{total numerical error}
\approx
\text{model error}
+\text{time discretization}
+\text{particle error}
+\text{network approximation}
+\text{optimization}
+\text{Monte Carlo evaluation}
$$`,
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
      heading: '19. Tài liệu tham khảo cốt lõi',
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
              title: 'Almgren & Chriss · Optimal Execution of Portfolio Transactions',
              note: 'Efficient frontier giữa market impact và volatility risk trong optimal execution.',
              href: 'https://docslib.org/doc/1384720/optimal-execution-of-portfolio-transactions',
            },
            {
              title: 'Cardaliaguet & Lehalle · Mean Field Game of Controls and Trade Crowding',
              note: 'Đưa optimal liquidation vào extended MFG với interaction qua controls và crowding.',
              href: 'https://arxiv.org/abs/1610.09904',
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
              title: 'MIT OpenCourseWare · Stochastic Calculus',
              note: 'Brownian motion, Itô calculus và các building blocks của continuous-time finance.',
              href: 'https://ocw.mit.edu/courses/15-450-analytics-of-finance-fall-2010/511a32446b77d2566dae5d97253e83c9_MIT15_450F10_rec03.pdf',
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
