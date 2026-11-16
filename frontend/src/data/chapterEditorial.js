export default {
  "5": {
    "sections": {
      "section-3": {
        "title": "Hàm ẩn: lấy đạo hàm từ quan hệ $g(x,y)=0$",
        "conditions": "Giả sử $g$ có các đạo hàm riêng cấp một liên tục gần $(x_0,y_0)$, $g(x_0,y_0)=0$ và $g_y(x_0,y_0)\\ne0$. Khi đó quan hệ xác định cục bộ một nhánh khả vi $y=y(x)$.",
        "definition": "Tại điểm chính quy thỏa các điều kiện trên, có thể tính độ dốc của nhánh mà không cần giải phương trình để cô lập $y$.",
        "content": "### Vì sao phải đạo hàm cả $y$?\n\nTrên nhánh nghiệm, $x$ và $y$ cùng thay đổi nhưng luôn thỏa $g(x,y(x))=0$. Lấy đạo hàm theo $x$:\n$$\ng_x+g_y y'=0\n$$\nỞ đây $g_x$ được tính khi giữ $y$ cố định, còn $g_y$ được tính khi giữ $x$ cố định. Hạng $g_y y'$ xuất hiện vì $y$ cũng thay đổi theo $x$. Khi $g_y\\ne0$, suy ra\n$$\ny'=\\frac{dy}{dx}=-\\frac{g_x}{g_y}\n$$\n\n### Ví dụ: hệ số góc của một đường cong\n\nCho quan hệ $x^2+xy+y^2-7=0$ và điểm $(1,2)$. Điểm này thuộc đường cong vì $1+2+4-7=0$. Với $g(x,y)=x^2+xy+y^2-7$, ta có $g_x=2x+y$ và $g_y=x+2y$.",
        "workedExample": {
          "question": "Tính hệ số góc tiếp tuyến của $x^2+xy+y^2=7$ tại $(1,2)$, rồi viết phương trình tiếp tuyến.",
          "steps": [
            "Kiểm tra $1^2+1\\cdot2+2^2=7$, nên điểm nằm trên đường cong.",
            "Đặt $g=x^2+xy+y^2-7$. Khi đó $g_x=2x+y$ và $g_y=x+2y$.",
            "Tại $(1,2)$, $g_x=4$ và $g_y=5\\ne0$, do đó $y\\prime=-\\frac45$.",
            "Tiếp tuyến có hệ số góc $-\\frac45$ và đi qua $(1,2)$: $y-2=-\\frac45(x-1)$."
          ],
          "casioTip": "Thay điểm vào phương trình gốc trước. Chỉ sau khi xác nhận điểm thuộc đường cong mới tính đạo hàm tại đó."
        },
        "trap": {
          "title": "Coi $y$ là hằng số trong toàn bộ phép đạo hàm",
          "wrong": "Lấy đạo hàm $xy$ theo $x$ thành $y$ rồi bỏ qua việc $y$ thay đổi.",
          "right": "Trên nhánh nghiệm, $(xy)prime=y+xy\\prime$.",
          "explanation": "Đạo hàm riêng $g_x$ giữ $y$ cố định; khi đạo hàm cả quan hệ theo $x$, phải cộng thêm phần do $y(x)$ thay đổi."
        }
      },
      "derivative-formulas": {
        "title": "Bảng đạo hàm cơ bản và hàm hợp",
        "conditions": "Dùng các công thức tại những điểm mà hàm số và biểu thức đạo hàm tương ứng xác định. Với hàm hợp, đặt u=u(x) và kiểm tra miền xác định của u trước khi thay vào công thức.",
        "definition": "Bảng dưới đây gom các công thức thường dùng. Cột điều kiện nêu miền cần kiểm tra trước khi tính.",
        "content": "### Hàm cơ bản\n\n| Hàm số | Đạo hàm | Điều kiện |\n|:--|:--:|:--|\n| $c$ | $0$ | $c$ là hằng số |\n| $x^\\alpha$ | $\\alpha x^{\\alpha-1}$ | $x>0$ nếu $\\alpha$ tùy ý |\n| $\\sqrt{x}$ | $\\frac{1}{2\\sqrt{x}}$ | $x>0$ |\n| $\\frac{1}{x}$ | $-\\frac{1}{x^2}$ | $x\\ne0$ |\n| $e^x$ | $e^x$ | $x\\in\\mathbb R$ |\n| $a^x$ | $a^x\\ln a$ | $a>0$ |\n\nVới $x^\\alpha$, điều kiện $x>0$ dùng cho số mũ thực bất kỳ; nếu $\\alpha$ là số nguyên dương thì hàm còn có thể xác định và khả vi tại các giá trị âm.\n\n### Logarit và lượng giác\n\n| Hàm số | Đạo hàm | Điều kiện |\n|:--|:--:|:--|\n| $\\ln x$ | $\\frac{1}{x}$ | $x>0$ |\n| $\\log_a x$ | $\\frac{1}{x\\ln a}$ | $x>0,\\ a>0,\\ a\\ne1$ |\n| $\\sin x$ | $\\cos x$ | $x\\in\\mathbb R$ |\n| $\\cos x$ | $-\\sin x$ | $x\\in\\mathbb R$ |\n| $\\tan x$ | $\\frac{1}{\\cos^2x}$ | $\\cos x\\ne0$ |\n| $\\cot x$ | $-\\frac{1}{\\sin^2x}$ | $\\sin x\\ne0$ |\n\n### Hàm lượng giác ngược\n\n| Hàm số | Đạo hàm | Điều kiện |\n|:--|:--:|:--|\n| $\\arcsin x$ | $\\frac{1}{\\sqrt{1-x^2}}$ | $-1<x<1$ |\n| $\\arccos x$ | $-\\frac{1}{\\sqrt{1-x^2}}$ | $-1<x<1$ |\n| $\\arctan x$ | $\\frac{1}{1+x^2}$ | $x\\in\\mathbb R$ |\n| $\\operatorname{arccot}x$ | $-\\frac{1}{1+x^2}$ | $x\\in\\mathbb R$ |\n\n### Bảng đạo hàm của hàm hợp\n\nKhi $u=u(x)$, giữ nguyên biểu thức $u$ trong công thức ngoài rồi nhân thêm $u'$:\n\n| Hàm hợp | Đạo hàm | Điều kiện |\n|:--|:--:|:--|\n| $u^\\alpha$ | $\\alpha u^{\\alpha-1}u'$ | $u>0$ nếu $\\alpha$ tùy ý; số mũ nguyên xét trên miền thực thích hợp |\n| $\\sqrt{u}$ | $\\frac{u'}{2\\sqrt{u}}$ | $u>0$ |\n| $\\frac{1}{u}$ | $-\\frac{u'}{u^2}$ | $u\\ne0$ |\n| $e^u$ | $e^u u'$ | $u\\in\\mathbb R$ |\n| $a^u$ | $a^u\\ln(a)\\,u'$ | $a>0$ |\n| $\\ln u$ | $\\frac{u'}{u}$ | $u>0$ |\n| $\\log_a u$ | $\\frac{u'}{u\\ln a}$ | $u>0,\\ a>0,\\ a\\ne1$ |\n| $\\sin u$ | $\\cos(u)u'$ | $u\\in\\mathbb R$ |\n| $\\cos u$ | $-\\sin(u)u'$ | $u\\in\\mathbb R$ |\n| $\\tan u$ | $\\frac{u'}{\\cos^2u}$ | $\\cos u\\ne0$ |\n| $\\cot u$ | $-\\frac{u'}{\\sin^2u}$ | $\\sin u\\ne0$ |\n\nTrên mỗi khoảng mà $u\\ne0$, ta còn có $(\\ln|u|)'=\\frac{u'}{u}$. Không thay $\\ln|u|$ bằng $\\ln u$ khi $u<0$, vì khi đó $\\ln u$ không xác định trong $\\mathbb R$.\n\nCông thức hàm ngược cũng cần đúng điểm tương ứng: nếu $y_0=f(x_0)$ và $f'(x_0)\\ne0$, thì $(f^{-1})'(y_0)=\\frac{1}{f'(x_0)}$. Đạo hàm ở mẫu được tính tại $x_0$, không phải tại $y_0$.",
        "workedExample": {
          "question": "Tính đạo hàm của $y=arctan(2x)$ và $z=\\ln|x-1|$; nêu miền xác định của từng đạo hàm.",
          "steps": [
            "Với $y$, công thức hàm hợp cho $y\\prime=\\frac{2}{1+4x^2}$, xác định với mọi $x\\in\\mathbb R$.",
            "Với $z$, cần $x\\ne1$. Trên miền này, $z\\prime=\\frac{1}{x-1}$.",
            "Tại $x=0$, hai đạo hàm lần lượt là $2$ và $-1$. Biểu thức $\\ln(x-1)$ không xác định tại $x=0$, còn $\\ln|x-1|$ thì có."
          ],
          "casioTip": "Trước khi thế số, kiểm tra điểm có thuộc miền xác định của hàm ban đầu hay không."
        }
      },
      "section-2": {
        "title": "Hàm hợp: lấy đạo hàm ngoài rồi nhân với $u\\prime$",
        "conditions": "Cho $u=u(x)$ khả vi và $y=F(u)$. Công thức áp dụng tại các điểm mà cả hàm trong lẫn hàm ngoài đều xác định.",
        "definition": "Với $y=F(u(x))$, đạo hàm theo $x$ là\n$$\n(F(u))'=F'(u)\\,u'\n$$",
        "content": "### Cách tính dễ nhớ\n\nLấy đạo hàm của công thức ngoài như bình thường, tạm xem $u$ là biến; giữ nguyên $u$ trong kết quả, rồi nhân thêm $u'$. Không cần khai triển biểu thức bên trong trước.\n\nChẳng hạn, với $y=(4x+5)^3$, đạo hàm ngoài là $3(4x+5)^2$, còn đạo hàm trong là $4$. Do đó,\n$$\ny'=3(4x+5)^2\\cdot4=12(4x+5)^2\n$$\n\n### Khi có thêm phép nhân hoặc phép chia\n\nHàm hợp vẫn được kết hợp với các quy tắc đã biết:\n$$\n(uv)'=u'v+uv',\\qquad\n\\left(\\frac{u}{v}\\right)'=\\frac{u'v-uv'}{v^2},\\quad v\\ne0\n$$\nTrong quy tắc tích, mỗi lần lấy đạo hàm một thừa số thì giữ thừa số còn lại nguyên; không nhân hai đạo hàm với nhau.",
        "workedExample": {
          "question": "Tính $y\\prime$ của $y=\\sqrt{2x^2+3}$ tại $x=1$.",
          "steps": [
            "Đặt $u=2x^2+3$, khi đó $u\\prime=4x$ và công thức ngoài là $\\sqrt{u}$.",
            "Đạo hàm ngoài rồi nhân với đạo hàm trong: $y\\prime=\\frac{u\\prime}{2\\sqrt{u}}=\\frac{2x}{\\sqrt{2x^2+3}}$.",
            "Thay $x=1$: $y\\prime(1)=\\frac{2}{\\sqrt5}$."
          ],
          "casioTip": "Tính đạo hàm của biểu thức ngoài trước, sau đó mới nhân với đạo hàm của biểu thức nằm bên trong."
        },
        "trap": {
          "title": "Bỏ quên đạo hàm của biểu thức bên trong",
          "wrong": "$(4x+5)^3$ được lấy đạo hàm thành $3(4x+5)^2$.",
          "right": "Phải nhân thêm $(4x+5)prime=4$, nên kết quả là $12(4x+5)^2$.",
          "explanation": "Độ thay đổi của biểu thức ngoài còn phụ thuộc vào tốc độ thay đổi của biểu thức trong."
        }
      },
      "section-4": {
        "title": "Vi phân: xấp xỉ mức thay đổi quanh một điểm",
        "conditions": "Giả sử $f$ khả vi tại $x_0$. Khi chọn bước nhỏ $dx$, vi phân cấp một cho xấp xỉ tuyến tính của mức thay đổi thực.",
        "definition": "Tại điểm $x_0$, vi phân của $y=f(x)$ được định nghĩa bởi\n$$\ndy=f\\prime(x_0)\\,dx\n$$",
        "content": "### Phân biệt $dy$ và $\\Delta y$\n\nNếu $dx=\\Delta x$, thì $dy$ là phần tuyến tính dùng để ước lượng mức thay đổi thực\n$$\n\\Delta y=f(x_0+\\Delta x)-f(x_0)\n$$\nKhi bước đủ nhỏ, $\\Delta y\\approx dy$. Hai đại lượng không nhất thiết bằng nhau; sai số phụ thuộc độ cong của hàm và độ lớn của bước.\n\n### Ví dụ: ước lượng căn bậc hai\n\nƯớc lượng $\\sqrt{4{,}08}$ bằng cách lấy $f(x)=\\sqrt{x}$ tại điểm gần nhất $x_0=4$. Ta có $f(4)=2$ và $f\\prime(4)=\\frac14$. Với $dx=0{,}08$,\n$$\ndy=\\frac14\\cdot0{,}08=0{,}02,\\qquad\n\\sqrt{4{,}08}\\approx2+0{,}02=2{,}02\n$$\nGiá trị thực gần $2{,}019901$, nên xấp xỉ này sai khoảng $0{,}000099$.",
        "workedExample": {
          "question": "Dùng vi phân tại $x_0=4$ để ước lượng $\\sqrt{4{,}08}$ và nêu giá trị $dx$ đã chọn.",
          "steps": [
            "Chọn $f(x)=\\sqrt{x}$, $x_0=4$ và $dx=4{,}08-4=0{,}08$.",
            "Ta có $f\\prime(x)=\\frac{1}{2\\sqrt{x}}$, nên $f\\prime(4)=\\frac14$.",
            "Suy ra $dy=\\frac14(0{,}08)=0{,}02$ và $f(4{,}08)\\approx f(4)+dy=2{,}02$."
          ],
          "casioTip": "Điểm chuẩn được chọn gần giá trị cần ước lượng để bước dx nhỏ và xấp xỉ tuyến tính đáng tin cậy hơn."
        }
      }
    }
  },
  "6": {
    "summary": "Chương đi từ đạo hàm biên, đại lượng tuyệt đối có đơn vị, đến hệ số co giãn, đại lượng đo phản ứng theo phần trăm. Sau đó phân biệt tốc độ trung bình với tốc độ biên và áp dụng co giãn cho quan hệ ẩn.",
    "objectives": [
      "Diễn giải đạo hàm biên theo đơn vị và ước lượng thay đổi nhỏ của đầu ra.",
      "Tính hệ số co giãn bằng đạo hàm nhân với tỷ số mức đầu vào trên mức đầu ra; đọc dấu và ý nghĩa phần trăm.",
      "Phân biệt giá trị trung bình với giá trị biên và giải thích khi nào mức trung bình tăng hoặc giảm.",
      "Tính co giãn của một quan hệ ẩn sau khi kiểm tra điều kiện tại điểm đang xét."
    ],
    "order": [
      "section-1",
      "section-3",
      "section-2",
      "implicit-elasticity"
    ],
    "removed": [],
    "sections": {
      "section-1": {
        "title": "Biên: mức thay đổi tuyệt đối trên một đơn vị đầu vào",
        "conditions": "Cho $y=f(x)$ khả vi tại $x_0$. Khi diễn giải, cần nêu đơn vị đo của cả $x$ và $y$.",
        "definition": "Đạo hàm biên tại $x_0$ là\n$$\ny\\prime(x_0)=\\frac{dy}{dx}\\bigg|_{x=x_0}\n$$\nVới một bước nhỏ $dx$, mức thay đổi đầu ra được ước lượng bởi $dy=y\\prime(x_0)dx$.",
        "content": "### Đơn vị và ý nghĩa\n\nNếu $x$ đo bằng giờ còn $y$ đo bằng sản phẩm, thì $y\\prime$ có đơn vị sản phẩm mỗi giờ. Đạo hàm là mức thay đổi của đầu ra cho một đơn vị đầu vào tại trạng thái đang xét; nó chưa phải tỷ lệ phần trăm.\n\n### Ví dụ có đối chiếu\n\nCho $y=4x^2+4x+3$, trong đó $x$ là số giờ. Khi $x=5$,\n$$\ny\\prime=8x+4=44\n$$\nNếu thời gian tăng $dx=0{,}1$ giờ, mức tăng tuyến tính được ước lượng là $dy=44(0{,}1)=4{,}4$ đơn vị đầu ra. Tính từ hàm gốc, mức tăng chính xác là $y(5{,}1)-y(5)=4{,}44$. Đạo hàm biên hữu ích cho bước nhỏ; với bước hữu hạn, nó là xấp xỉ.",
        "workedExample": {
          "question": "Với $y=4x^2+4x+3$, ước lượng mức tăng của $y$ khi $x$ tăng từ $5$ lên $5{,}1$, rồi so sánh với thay đổi chính xác.",
          "steps": [
            "$y\\prime=8x+4$, nên tại $x=5$ ta có $y\\prime(5)=44$.",
            "Vì $dx=0{,}1$, vi phân ước lượng là $dy=44(0{,}1)=4{,}4$.",
            "Từ hàm ban đầu, $y(5{,}1)-y(5)=127{,}44-123=4{,}44$. Sai khác $0{,}04$ xuất hiện vì độ dốc thay đổi trong khoảng."
          ],
          "casioTip": "Nhân đạo hàm biên với bước đầu vào để được mức thay đổi xấp xỉ; không xem đạo hàm là mức tăng của cả một khoảng."
        }
      },
      "section-3": {
        "title": "Hệ số co giãn: từ thay đổi tuyệt đối đến phần trăm",
        "conditions": "Xét tại điểm có $x\\ne0$ và $y\\ne0$. Hệ số co giãn đo phản ứng cục bộ của tỷ lệ phần trăm đầu ra theo tỷ lệ phần trăm đầu vào.",
        "definition": "So sánh tỷ lệ thay đổi nhỏ của $y$ với tỷ lệ thay đổi nhỏ của $x$:\n$$\n\\varepsilon=\n\\frac{\\dfrac{dy}{y}}{\\dfrac{dx}{x}}\n=\n\\frac{dy}{dx}\\times\\frac{x}{y}\n$$",
        "content": "### Vì sao xuất hiện $\\frac{x}{y}$?\n\nĐạo hàm $\\frac{dy}{dx}$ có đơn vị $y$ trên đơn vị $x$, nên phụ thuộc cách đo. Chia mức thay đổi cho chính mức hiện tại tạo tỷ lệ phần trăm: $\\frac{dy}{y}$ ở đầu ra và $\\frac{dx}{x}$ ở đầu vào. Lấy tỷ số hai phần trăm ấy, ta có công thức ở trên. Có thể nhớ theo thao tác: lấy đạo hàm $\\frac{dy}{dx}$ rồi nhân chéo với $\\frac{x}{y}$.\n\n### Đọc dấu và độ lớn\n\nNếu $\\varepsilon>0$, hai đại lượng biến thiên cùng chiều gần điểm xét; nếu $\\varepsilon<0$, chúng biến thiên ngược chiều. Khi $x$ tăng khoảng $1\\%$, $y$ thay đổi xấp xỉ $\\varepsilon\\%$. Đây là xấp xỉ cho thay đổi nhỏ, không phải cam kết chính xác cho một bước lớn.\n\n### Tính trên ví dụ vừa học\n\nVới $y=4x^2+4x+3$ tại $x=5$, ta có $y=123$ và $y\\prime=44$. Vì vậy\n$$\n\\varepsilon=44\\times\\frac{5}{123}\n=\\frac{220}{123}\\approx1{,}79\n$$\nTại mức này, nếu $x$ tăng khoảng $1\\%$, $y$ tăng xấp xỉ $1{,}79\\%$. Đạo hàm $44$ là mức tăng tuyệt đối trên một đơn vị $x$; co giãn $1{,}79$ là phản ứng theo phần trăm.",
        "workedExample": {
          "question": "Tính hệ số co giãn của $y=3x^2$ tại $x=2$ và diễn giải khi $x$ tăng khoảng $1\\%$.",
          "steps": [
            "Tại $x=2$, $y=12$ và $y\\prime=6x=12$.",
            "Nhân đạo hàm với tỷ số đầu vào trên đầu ra: $\\varepsilon=12\\times\\frac{2}{12}=2$.",
            "Do đó, quanh điểm này, $x$ tăng khoảng $1\\%$ thì $y$ tăng xấp xỉ $2\\%$."
          ],
          "casioTip": "Đạo hàm cho mức thay đổi tuyệt đối; hệ số co giãn đổi mức đó thành phản ứng theo phần trăm."
        }
      },
      "implicit-elasticity": {
        "title": "Co giãn khi quan hệ được cho dưới dạng ẩn",
        "conditions": "Quan hệ $g(x,y)=0$ xác định cục bộ $y$ theo $x$ tại điểm xét, với $g_y\\ne0$, $x\\ne0$ và $y\\ne0$.",
        "definition": "Đạo hàm của nhánh là $y\\prime=-\\frac{g_x}{g_y}$. Thay độ dốc này vào công thức co giãn:\n$$\n\\varepsilon=\\frac{dy}{dx}\\times\\frac{x}{y}\n=-\\frac{g_x}{g_y}\\times\\frac{x}{y}\n$$",
        "content": "Trước tiên kiểm tra điểm có thỏa $g(x,y)=0$; tiếp theo tính $g_x,g_y$ tại điểm ấy; cuối cùng dùng độ dốc để tìm phản ứng theo phần trăm. Không cần giải phương trình để viết tường minh $y$.\n\n### Ví dụ\n\nQuan hệ $xy=12$ tại $(3,4)$ có $g(x,y)=xy-12$, nên $g_x=4$ và $g_y=3$. Do đó $y\\prime=-\\frac43$ và\n$$\n\\varepsilon=-\\frac43\\times\\frac34=-1\n$$\nMột thay đổi nhỏ $1\\%$ của $x$ tương ứng với thay đổi xấp xỉ $-1\\%$ của $y$.",
        "workedExample": {
          "question": "Quan hệ $xy=12$ xác định $y$ theo $x$ trong góc phần tư dương. Tính hệ số co giãn tại $(3,4)$.",
          "steps": [
            "Điểm thuộc đường cong vì $3\\cdot4=12$.",
            "Với $g=xy-12$, ta có $g_x=y=4$ và $g_y=x=3$, nên $y\\prime=-\\frac43$.",
            "Suy ra $\\varepsilon=y\\prime\\times\\frac{x}{y}=-\\frac43\\times\\frac34=-1$."
          ],
          "casioTip": "Điều kiện $g_y\\ne0$ cho phép tính độ dốc; $x,y\\ne0$ cần để diễn giải theo tỷ lệ phần trăm."
        }
      },
      "section-2": {
        "title": "Tốc độ trung bình và tốc độ biên",
        "conditions": "So sánh hai đại lượng trên cùng một hàm và cùng hệ đơn vị.",
        "definition": "Trên đoạn từ $x_1$ đến $x_2$, tốc độ thay đổi trung bình là\n$$\n\\frac{f(x_2)-f(x_1)}{x_2-x_1}\n$$\nTốc độ biên tại $x_0$ là đạo hàm $f\\prime(x_0)$, tức độ dốc tại một trạng thái cụ thể.",
        "content": "Tốc độ trung bình gộp toàn bộ biến thiên trong một khoảng; tốc độ biên mô tả phản ứng ngay tại điểm. Khi hai đầu mút tiến gần nhau, độ dốc cát tuyến tiến đến độ dốc tiếp tuyến, nhưng với một đoạn hữu hạn hai giá trị thường khác nhau.\n\n### Ví dụ\n\nVới $f(x)=x^2$, tốc độ trung bình từ $x=2$ đến $x=3$ là $\\frac{9-4}{3-2}=5$, còn tốc độ biên tại $x=2$ là $f\\prime(2)=4$. Số $5$ mô tả cả đoạn; số $4$ chỉ mô tả điểm đầu.",
        "workedExample": {
          "question": "Với $f(x)=x^2$, tính tốc độ trung bình trên $[2,3]$ và tốc độ biên tại $x=2$.",
          "steps": [
            "Tốc độ trung bình là $\\frac{f(3)-f(2)}{3-2}=5$.",
            "Đạo hàm $f\\prime(x)=2x$, nên tốc độ biên tại $2$ là $4$.",
            "Hai kết quả khác nhau vì một giá trị đo cả khoảng còn giá trị kia đo độ dốc tại một điểm."
          ],
          "casioTip": "Tỷ số sai phân dùng hai đầu mút; đạo hàm dùng một trạng thái giới hạn."
        }
      }
    }
  },
  "7": {
    "summary": "Đạo hàm riêng đo tác động cục bộ của từng yếu tố khi giữ các yếu tố khác cố định. Vi phân toàn phần ghép các tác động ấy để ước lượng thay đổi đồng thời; hệ số co giãn và mô hình nhiều đầu vào là các ứng dụng trực tiếp.",
    "objectives": [
      "Tính và diễn giải đạo hàm riêng theo một biến, giữ các biến còn lại cố định.",
      "Dùng gradient để gom các tác động riêng và vi phân toàn phần để ước lượng thay đổi đồng thời.",
      "Tính hệ số co giãn riêng, nêu rõ yếu tố thay đổi và các yếu tố giữ nguyên.",
      "Áp dụng đạo hàm riêng và co giãn vào một mô hình nhiều đầu vào ở mức cơ bản."
    ],
    "order": [
      "section-1",
      "section-2",
      "partial-elasticity",
      "section-3"
    ],
    "removed": [
      "multivariable-chain"
    ],
    "sections": {
      "section-1": {
        "title": "Đạo hàm riêng: tách tác động của từng yếu tố",
        "conditions": "Xét hàm giá trị $P=P(x,y,z)$ khả vi theo các biến đầu vào. Mỗi đạo hàm riêng được tính khi giữ cố định những biến còn lại.",
        "definition": "Với $f=f(x,y,z)$, đạo hàm riêng theo $x$ được ký hiệu\n$\nf_x=\\frac{\\partial f}{\\partial x}=\\nabla_x f\n$\nNó đo tốc độ thay đổi của $f$ khi chỉ $x$ biến động tại mức đang xét. Với ba biến, gradient là $\\nabla f=(f_x,f_y,f_z)$.\n\nKhi lấy đạo hàm theo $x$, giữ $y,z$ cố định như các số. Số hạng không chứa $x$ là hằng số nên đạo hàm bằng $0$; trong tích, gom các thừa số không phụ thuộc $x$ thành hệ số rồi đạo hàm phần còn lại. Chẳng hạn, $\\frac{\\partial}{\\partial x}(a y x)=ay$ nếu $a,y$ được giữ cố định.",
        "content": "### Ví dụ: mô hình hồi quy giá nhà\n\nGiả sử $P$ đo giá nhà theo đơn vị trăm triệu đồng; $x$ là diện tích tính theo đơn vị $10\\,\\mathrm{m}^2$, $y$ là khoảng cách đến trung tâm tính bằng kilômét, còn $z$ là điểm tiện ích. Một mô hình hồi quy minh họa là\n$$\nP=8+0{,}25x-0{,}4y+0{,}6z+0{,}02xy\n$$\nKhi tính theo $x$, các số hạng $8$, $-0{,}4y$ và $0{,}6z$ không đổi nên đạo hàm bằng $0$. Trong tích $0{,}02xy$, giữ $0{,}02y$ cố định và lấy đạo hàm theo $x$. Tương tự cho các biến còn lại:\n$$\nP_x=0{,}25+0{,}02y,\\qquad\nP_y=-0{,}4+0{,}02x,\\qquad\nP_z=0{,}6\n$$\nTại $(x,y,z)=(7,4,3)$,\n$$\n\\nabla P=(0{,}33,-0{,}26,0{,}6)\n$$\nTrong mô hình này, tăng một đơn vị diện tích $x$ làm giá dự báo tăng khoảng $0{,}33$ trăm triệu đồng khi giữ $y,z$ cố định; tăng một kilômét khoảng cách làm giá dự báo giảm khoảng $0{,}26$ trăm triệu đồng khi giữ $x,z$ cố định.",
        "workedExample": {
          "question": "Với mô hình $P=8+0{,}25x-0{,}4y+0{,}6z+0{,}02xy$, tính các đạo hàm riêng tại $(7,4,3)$.",
          "steps": [
            "Giữ $y,z$ cố định: $P_x=0{,}25+0{,}02y$, nên $P_x(7,4,3)=0{,}33$.",
            "Giữ $x,z$ cố định: $P_y=-0{,}4+0{,}02x$, nên $P_y(7,4,3)=-0{,}26$.",
            "Theo $z$, chỉ số hạng $0{,}6z$ thay đổi, do đó $P_z=0{,}6$.",
            "Gradient tại điểm là $\\nabla P=(0{,}33,-0{,}26,0{,}6)$; mỗi thành phần giữ hai yếu tố kia cố định."
          ],
          "casioTip": "Trước mỗi lần lấy đạo hàm, chỉ rõ biến đang thay đổi. Mọi biến còn lại tạm thời là hằng số."
        },
        "trap": {
          "title": "Đạo hàm đồng thời thay vì đạo hàm riêng",
          "wrong": "Lấy đạo hàm theo $x$ rồi cũng đạo hàm theo $y$ vì cả hai cùng có trong công thức.",
          "right": "Trong $P_x$, giữ $y,z$ cố định; trong $P_y$, giữ $x,z$ cố định.",
          "explanation": "Đạo hàm riêng tách riêng tác động của từng đầu vào tại cùng một trạng thái."
        },
        "scene": "partial"
      },
      "section-2": {
        "title": "Vi phân toàn phần: ghép các thay đổi nhỏ",
        "conditions": "Dùng tại điểm mà hàm khả vi. Các mức thay đổi cần đủ nhỏ để xấp xỉ tuyến tính có ý nghĩa.",
        "definition": "Với $P=P(x,y,z)$, vi phân toàn phần tại điểm đang xét là\n$$\ndP=P_x\\,dx+P_y\\,dy+P_z\\,dz\n$$\nKhi $dx,dy,dz$ là các thay đổi nhỏ, $\\Delta P\\approx dP$.",
        "content": "Mỗi số hạng biểu diễn đóng góp bậc nhất của một yếu tố; đạo hàm riêng đều được tính tại cùng điểm ban đầu. Cộng các đóng góp để ước lượng tác động đồng thời.\n\n### Tiếp tục ví dụ giá nhà\n\nTại $(7,4,3)$, gradient là $(0{,}33,-0{,}26,0{,}6)$. Nếu diện tích tăng $2\\,\\mathrm{m}^2$ thì $dx=0{,}2$; nếu nhà gần trung tâm hơn $0{,}5$ km thì $dy=-0{,}5$; giả sử điểm tiện ích tăng $1$ thì $dz=1$. Khi đó\n$$\ndP=0{,}33(0{,}2)-0{,}26(-0{,}5)+0{,}6(1)=0{,}796\n$$\nGiá dự báo tăng xấp xỉ $0{,}796$ trăm triệu đồng, tức khoảng $79{,}6$ triệu đồng. Với mô hình này, thay đổi chính xác là $0{,}794$ trăm triệu đồng; phần chênh nhỏ đến từ số hạng tích $0{,}02\\,dx\\,dy$ mà vi phân cấp một bỏ qua.",
        "workedExample": {
          "question": "Dùng vi phân toàn phần của mô hình giá nhà để ước lượng thay đổi khi $dx=0{,}2$, $dy=-0{,}5$, $dz=1$ tại $(7,4,3)$.",
          "steps": [
            "Tại điểm đã cho, $P_x=0{,}33$, $P_y=-0{,}26$, $P_z=0{,}6$.",
            "Thay vào $dP=P_xdx+P_ydy+P_zdz$: $dP=0{,}33(0{,}2)-0{,}26(-0{,}5)+0{,}6=0{,}796$.",
            "Vì đơn vị của $P$ là trăm triệu đồng, mức tăng ước lượng khoảng $79{,}6$ triệu đồng."
          ],
          "casioTip": "Giữ cùng một điểm để tính mọi đạo hàm riêng; sau đó nhân từng đạo hàm với mức đổi của đúng biến."
        }
      },
      "multivariable-chain": {
        "title": "Quy tắc dây chuyền: cộng các đường phụ thuộc",
        "conditions": "Hàm ngoài khả vi tại trạng thái trung gian; mỗi biến trung gian khả vi theo biến đang xét.",
        "definition": "Nếu $z=f(u,v)$, $u=u(t)$ và $v=v(t)$ thì\n$$\\frac{dz}{dt}=f_u\\frac{du}{dt}+f_v\\frac{dv}{dt}.$$\nNếu $u=u(x,y)$ và $v=v(x,y)$ thì\n$$z_x=f_u u_x+f_v v_x,\\qquad z_y=f_u u_y+f_v v_y.$$",
        "content": "### Theo dõi biến trung gian\nVới $z=f(u,v)$, nếu $u$ và $v$ đều thay đổi theo $t$, thì $t$ ảnh hưởng đến $z$ qua hai đường: $t\\to u\\to z$ và $t\\to v\\to z$. Đường thứ nhất đóng góp $f_u\\frac{du}{dt}$; đường thứ hai đóng góp $f_v\\frac{dv}{dt}$. Cộng các đóng góp để được tốc độ tổng.\n\n### Công thức theo từng biến\nNếu $u=u(x,y)$ và $v=v(x,y)$, thì\n$$z_x=f_u u_x+f_v v_x,\\qquad z_y=f_u u_y+f_v v_y.$$\nĐạo hàm của hàm ngoài được tính tại trạng thái $(u(x,y),v(x,y))$. Không bỏ đường phụ thuộc nào và không đánh giá đạo hàm ngoài ở trạng thái khác.\n\n### Kiểm tra bằng khai triển trực tiếp\nCho $z=u^2+uv$, $u=t^2$, $v=3t$. Tại $t=1$, $u=1$, $v=3$, $u'=2$, $v'=3$. Khi đó $f_u=2u+v=5$, $f_v=u=1$, và\n$$\\frac{dz}{dt}=5(2)+1(3)=13.$$\nThay trước $u,v$ vào được $z=t^4+3t^3$, cũng cho $z'(1)=13$.",
        "workedExample": {
          "question": "Cho $z=u^2+uv$, $u=t^2$, $v=3t$. Tính $dz/dt$ tại $t=1$ theo quy tắc dây chuyền.",
          "steps": [
            "Tại $t=1$: $u=1$, $v=3$, $u'=2$, $v'=3$.",
            "Với $f(u,v)=u^2+uv$, ta có $f_u=5$ và $f_v=1$ tại trạng thái đó.",
            "Vậy $dz/dt=f_u u'+f_v v'=5(2)+1(3)=13$."
          ],
          "casioTip": "Mỗi biến trung gian phụ thuộc vào $t$ tạo một tích; phải cộng các tích ấy."
        },
        "recall": {
          "front": "Khi $z=f(u(t),v(t))$, vì sao công thức có hai số hạng?",
          "back": "Vì $t$ tác động đến $z$ qua cả $u$ lẫn $v$: $\\frac{dz}{dt}=f_u u'+f_v v'$."
        },
        "trap": {
          "title": "Chỉ tính một đường phụ thuộc",
          "wrong": "$\\frac{dz}{dt}=f_u u'$ dù $v$ cũng phụ thuộc vào $t$.",
          "right": "Cộng mọi đường: $\\frac{dz}{dt}=f_u u'+f_v v'$.",
          "explanation": "Bỏ một biến trung gian là bỏ mất một phần của tốc độ thay đổi tổng."
        }
      },
      "partial-elasticity": {
        "title": "Co giãn riêng: tác động theo tỷ lệ phần trăm",
        "conditions": "Xét tại điểm mà đầu ra và đầu vào tương ứng khác $0$. Các hệ số mô tả tác động riêng, khi các biến còn lại được giữ cố định.",
        "definition": "Với $P=P(x,y,z)$, co giãn riêng theo từng đầu vào là\n$$\n\\varepsilon_{P,x}=\\frac{x}{P}P_x,\\qquad\n\\varepsilon_{P,y}=\\frac{y}{P}P_y,\\qquad\n\\varepsilon_{P,z}=\\frac{z}{P}P_z\n$$",
        "content": "Hệ số này không còn đơn vị. Khi chỉ $x$ tăng khoảng $1\\%$ còn $y,z$ giữ nguyên, $P$ thay đổi xấp xỉ $\\varepsilon_{P,x}\\%$. Với nhiều thay đổi nhỏ đồng thời,\n$$\n\\frac{\\Delta P}{P}\\approx\n\\varepsilon_{P,x}\\frac{\\Delta x}{x}\n+\\varepsilon_{P,y}\\frac{\\Delta y}{y}\n+\\varepsilon_{P,z}\\frac{\\Delta z}{z}\n$$\nĐây là cách viết theo phần trăm của vi phân toàn phần; không cộng các hệ số co giãn riêng nếu chưa nhân với tỷ lệ thay đổi tương ứng.",
        "workedExample": {
          "question": "Với $P=P(x,y,z)$ tại điểm $P=100$, giả sử các hệ số co giãn riêng theo $x,y,z$ lần lượt là $0{,}4$, $-0{,}2$, $0{,}1$. Ước lượng thay đổi của $P$ khi $x$ tăng $2\\%$, $y$ giảm $5\\%$, còn $z$ tăng $3\\%$.",
          "steps": [
            "Tỷ lệ thay đổi tương đối xấp xỉ là $0{,}4(2\\%)+(-0{,}2)(-5\\%)+0{,}1(3\\%)$.",
            "Tổng bằng $1{,}7\\%$, nên giá trị $P$ tăng xấp xỉ $1{,}7\\%$.",
            "Vì $P=100$, mức tăng ước lượng là $1{,}7$ đơn vị."
          ],
          "casioTip": "Mỗi co giãn phải ghép với phần trăm thay đổi của đúng biến mà nó đo."
        }
      },
      "section-3": {
        "title": "Mô hình nhiều đầu vào: hàm Cobb–Douglas",
        "conditions": "Xét $Q=AK^\\alpha L^\\beta$ với $A,K,L>0$. Khi lấy đạo hàm riêng theo một đầu vào, giữ đầu vào còn lại cố định.",
        "definition": "Với $Q=AK^\\alpha L^\\beta$,\n$$\nQ_K=\\alpha\\frac{Q}{K},\\qquad\nQ_L=\\beta\\frac{Q}{L}\n$$\nCác co giãn riêng theo $K$ và $L$ lần lượt bằng $\\alpha$ và $\\beta$.",
        "content": "$Q_K$ đo sản lượng biên theo vốn khi lao động giữ nguyên; $Q_L$ đo sản lượng biên theo lao động khi vốn giữ nguyên. Vì hai hệ số co giãn bằng số mũ, tăng $K$ khoảng $1\\%$ trong khi giữ $L$ cố định làm $Q$ tăng xấp xỉ $\\alpha\\%$; tương tự, phản ứng theo $L$ là $\\beta\\%$.\n\nNếu đồng thời nhân cả hai đầu vào với $t>0$, sản lượng được nhân với $t^{\\alpha+\\beta}$. Vì vậy tổng số mũ nhỏ hơn, bằng hoặc lớn hơn $1$ tương ứng với lợi suất giảm dần, không đổi hoặc tăng dần theo quy mô.",
        "workedExample": {
          "question": "Cho $Q=5K^{2/3}L^{1/3}$. Tính hai sản phẩm biên, hai co giãn riêng và nhận xét lợi suất theo quy mô.",
          "steps": [
            "Giữ $L$ cố định: $Q_K=\\frac23\\frac{Q}{K}$. Giữ $K$ cố định: $Q_L=\\frac13\\frac{Q}{L}$.",
            "Co giãn riêng là $\\varepsilon_{Q,K}=\\frac23$ và $\\varepsilon_{Q,L}=\\frac13$.",
            "Tổng số mũ bằng $1$, nên hàm có lợi suất không đổi theo quy mô."
          ],
          "casioTip": "Đạo hàm riêng cho tác động biên; số mũ trong dạng Cobb–Douglas cho ngay co giãn riêng."
        }
      }
    }
  },
  "8": {
    "summary": "Chương này phân biệt cực trị địa phương với toàn cục, hệ thống hóa điều kiện tìm điểm dừng và tiêu chuẩn đạo hàm cấp hai, đồng thời chỉ rõ khi nào cần xét thêm hàm gốc hoặc biên miền.",
    "objectives": [
      "Dùng đạo hàm và bảng dấu để tìm cực trị một biến.",
      "Tìm điểm dừng hai biến và phân loại bằng định thức Hessian.",
      "Nhận biết trường hợp tiêu chuẩn cấp hai chưa kết luận.",
      "Kiểm tra biên và so sánh ứng viên khi tìm cực trị toàn cục."
    ],
    "order": [
      "one-variable-extrema",
      "section-1",
      "section-2",
      "degenerate-extrema",
      "section-3"
    ],
    "sections": {
      "one-variable-extrema": {
        "title": "Cực trị một biến: điểm tới hạn và bảng dấu",
        "conditions": "Xét hàm số trên khoảng hoặc đoạn được nêu; điều kiện đạo hàm áp dụng tại điểm trong miền mà hàm khả vi.",
        "definition": "Cực trị địa phương so sánh $f(x_0)$ với các giá trị tại những điểm đủ gần $x_0$; cực trị toàn cục so sánh với mọi điểm trong miền xét. Điểm tới hạn là điểm trong miền mà $f'(x_0)=0$ hoặc đạo hàm không tồn tại.",
        "content": "### Điều kiện cần không phải điều kiện đủ\nNếu $x_0$ là cực trị địa phương nằm trong miền trong và $f$ khả vi tại đó thì $f'(x_0)=0$. Chiều ngược lại không đúng: đạo hàm bằng không chỉ tạo một ứng viên.\n\n### Dùng bảng dấu\nChia trục số tại các nghiệm của $f'$ và các điểm $f'$ không tồn tại, rồi xét dấu trên từng khoảng:\n- $f'$ đổi $+\\to-$: hàm tăng rồi giảm, nên có cực đại địa phương.\n- $f'$ đổi $-\\to+$: hàm giảm rồi tăng, nên có cực tiểu địa phương.\n- Nếu dấu của $f'$ nghiêm ngặt như nhau trên hai khoảng hai bên, hàm không đổi chiều nên điểm không phải cực trị cô lập.\n\nNếu $f'(x_0)=0$, phép thử cấp hai cho cực tiểu khi $f''(x_0)>0$, cực đại khi $f''(x_0)<0$; nếu $f''(x_0)=0$ thì không kết luận. Trên đoạn $[a,b]$, để tìm max/min toàn cục, tính giá trị tại mọi điểm tới hạn trong $(a,b)$ và tại hai đầu mút, rồi so sánh.",
        "workedExample": {
          "question": "Dùng dấu đạo hàm để phân loại điểm tới hạn của $f(x)=x^3-3x$.",
          "steps": [
            "$f'(x)=3(x-1)(x+1)$ nên các điểm tới hạn là $-1$ và $1$.",
            "Dấu của $f'$ lần lượt là $+$, $-$, $+$ trên ba khoảng do hai điểm này chia ra.",
            "Tại $-1$ có đổi $+\\to-$ nên cực đại địa phương $f(-1)=2$; tại $1$ có đổi $-\\to+$ nên cực tiểu địa phương $f(1)=-2$."
          ]
        },
        "recall": {
          "front": "$f'(x_0)=0$ có đủ để kết luận cực trị không?",
          "back": "Không. Đây là điều kiện cần tại cực trị khả vi nằm trong miền trong; phải tiếp tục xét dấu đạo hàm hoặc dùng tiêu chuẩn cấp hai."
        },
        "trap": {
          "title": "Xem mọi điểm dừng là cực trị",
          "wrong": "$f'(x_0)=0$ nên $x_0$ chắc chắn là cực đại hoặc cực tiểu.",
          "right": "Kiểm tra dấu hai phía hoặc áp dụng tiêu chuẩn đạo hàm cấp hai.",
          "explanation": "Hàm $f(x)=x^3$ có $f'(0)=0$ nhưng không đạt cực trị tại $0$."
        }
      },
      "section-1": {
        "title": "Cực trị tự do hai biến: hệ điểm dừng",
        "conditions": "Cho $f(x,y)$ khả vi gần điểm $(x_0,y_0)$ nằm trong miền trong.",
        "definition": "Nếu $f$ đạt cực trị địa phương tại điểm trong và các đạo hàm riêng tồn tại thì $f_x(x_0,y_0)=0$ và $f_y(x_0,y_0)=0$.",
        "content": "### Tìm ứng viên\nTại cực trị trong miền, không thể tăng hoặc giảm hàm bằng một dịch chuyển nhỏ theo riêng trục $x$; do đó $f_x=0$. Lập luận tương tự theo trục $y$ cho $f_y=0$. Vì vậy ta giải hệ\n$$f_x(x,y)=0,\\qquad f_y(x,y)=0.$$\nNghiệm của hệ được gọi là điểm dừng và chỉ là ứng viên. Cần dùng Hessian ở mục kế tiếp để phân loại.\n\n### Giới hạn của điều kiện\nĐiều kiện này tìm điểm trong miền trong, không xử lý điểm trên biên. Với miền có biên, cực trị toàn cục có thể nằm ở cạnh hoặc góc; phải khảo sát riêng phần biên. Các điểm hàm xác định nhưng đạo hàm riêng không tồn tại cũng cần được xem xét.",
        "workedExample": {
          "question": "Tìm điểm dừng của $f(x,y)=x^2+xy+y^2-4x-5y$.",
          "steps": [
            "$f_x=2x+y-4$, $f_y=x+2y-5$.",
            "Giải $2x+y=4$, $x+2y=5$ được $(x,y)=(1,2)$.",
            "$(1,2)$ là điểm dừng; chưa kết luận loại cực trị cho đến khi xét Hessian."
          ]
        },
        "recall": {
          "front": "Điều kiện cần để một điểm trong miền là cực trị của hàm khả vi hai biến?",
          "back": "Hai đạo hàm riêng bằng không: $f_x=f_y=0$. Đây là bước tìm ứng viên, chưa phải điều kiện đủ."
        },
        "trap": {
          "title": "Dùng điều kiện trong miền cho điểm biên",
          "wrong": "Mọi điểm cực trị đều thỏa $f_x=f_y=0$.",
          "right": "Điều kiện này áp dụng cho điểm cực trị khả vi nằm trong miền trong; biên phải xét theo các hướng khả thi.",
          "explanation": "Trên biên, không phải mọi hướng dịch chuyển đều còn nằm trong miền."
        }
      },
      "section-2": {
        "title": "Định thức Hessian: phân loại điểm dừng",
        "conditions": "Giả sử các đạo hàm riêng cấp hai liên tục gần điểm dừng; các đại lượng được tính tại điểm ấy.",
        "definition": "Đặt $D_1=f_{xx}$ và $D_2=f_{xx}f_{yy}-f_{xy}^{2}$, với $f_{xy}=f_{yx}$. Nếu $D_2<0$ thì điểm yên ngựa; nếu $D_2>0$, dấu của $D_1$ phân biệt cực tiểu và cực đại.",
        "content": "### Hai đại lượng cần tính\nMa trận đạo hàm cấp hai là\n$$H_f=\\begin{pmatrix}f_{xx}&f_{xy}\\\\f_{yx}&f_{yy}\\end{pmatrix},\\qquad D_2=\\det H_f.$$\nTại điểm dừng, áp dụng lần lượt:\n- $D_2<0$: điểm yên ngựa, không phải cực trị.\n- $D_2>0$ và $D_1=f_{xx}>0$: cực tiểu địa phương.\n- $D_2>0$ và $D_1=f_{xx}<0$: cực đại địa phương.\n- $D_2=0$: phép thử không kết luận.\n\nĐịnh thức cho biết độ cong đổi dấu theo hướng hay không; khi định thức dương, dấu $f_{xx}$ cho biết độ cong cùng dấu là lên hay xuống. Phải xác nhận điểm dừng trước khi dùng tiêu chuẩn này.",
        "workedExample": {
          "question": "Phân loại điểm dừng $(1,2)$ của $f(x,y)=x^2+xy+y^2-4x-5y$.",
          "steps": [
            "$f_{xx}=2$, $f_{xy}=1$, $f_{yy}=2$.",
            "$D_1=2$ và $D_2=2\\cdot2-1^2=3>0$.",
            "Vì $D_1>0$, hàm đạt cực tiểu địa phương tại $(1,2)$."
          ]
        },
        "recall": {
          "front": "Khi $D_2>0$, dùng đại lượng nào để phân biệt cực đại và cực tiểu?",
          "back": "Dùng $D_1=f_{xx}$: $D_1>0$ cho cực tiểu, $D_1<0$ cho cực đại."
        },
        "trap": {
          "title": "Quên kiểm tra điểm dừng",
          "wrong": "Hessian dương xác định tại điểm bất kỳ nên điểm ấy là cực tiểu.",
          "right": "Giải $f_x=f_y=0$ trước, rồi mới dùng $D_1,D_2$ để phân loại.",
          "explanation": "Tiêu chuẩn Hessian này được áp dụng tại điểm dừng."
        }
      },
      "degenerate-extrema": {
        "title": "Khi Hessian không kết luận",
        "conditions": "Xét điểm dừng có $D_2=0$.",
        "definition": "$D_2=0$ chỉ cho biết đạo hàm cấp hai chưa đủ thông tin; điểm đó vẫn có thể là cực tiểu, cực đại hoặc điểm yên ngựa.",
        "content": "### Cùng một Hessian nhưng khác kết quả\nTại $(0,0)$, các hàm $x^4+y^4$, $-x^4-y^4$ và $x^4-y^4$ đều có đạo hàm cấp một, cấp hai bằng $0$. Tuy vậy, gốc lần lượt là cực tiểu, cực đại và điểm yên ngựa.\n\nVới $x^4-y^4$, trên đường $y=0$ giá trị dương khi $x\\ne0$, còn trên đường $x=0$ giá trị âm khi $y\\ne0$. Hai dấu trái ngược chứng minh gốc không phải cực trị. Trường hợp $D_2=0$, quay lại hàm gốc, phân tích dấu hoặc xét các đường đi đơn giản qua điểm; không tự kết luận từ Hessian.",
        "workedExample": {
          "question": "Phân loại $(0,0)$ đối với $f(x,y)=x^4-y^4$.",
          "steps": [
            "$f_x=4x^3$, $f_y=-4y^3$, nên gốc là điểm dừng; mọi đạo hàm cấp hai tại gốc bằng $0$.",
            "Trên $y=0$, $f=x^4>0$ nếu $x\\ne0$; trên $x=0$, $f=-y^4<0$ nếu $y\\ne0$.",
            "Hàm đổi dấu theo hướng đi nên gốc là điểm yên ngựa."
          ]
        },
        "recall": {
          "front": "$D_2=0$ cho phép kết luận điều gì?",
          "back": "Chỉ kết luận rằng phép thử cấp hai chưa đủ; cần xét trực tiếp hàm quanh điểm."
        },
        "trap": {
          "title": "Đồng nhất Hessian suy biến với yên ngựa",
          "wrong": "$D_2=0$ nên điểm dừng không thể là cực trị.",
          "right": "Xét dấu của hàm quanh điểm; Hessian suy biến có thể đi cùng cực tiểu hoặc cực đại.",
          "explanation": "$x^4+y^4$ đạt cực tiểu tại gốc dù Hessian tại đó bằng ma trận không."
        }
      },
      "section-3": {
        "title": "Cực trị toàn cục: kiểm tra cả miền",
        "conditions": "Hàm liên tục trên miền đóng và bị chặn thì đạt giá trị lớn nhất và nhỏ nhất trên miền đó.",
        "definition": "Các điểm dừng trong miền là một phần của danh sách ứng viên; biên, góc và điểm không khả vi cũng có thể chứa cực trị toàn cục.",
        "content": "### Quy trình so sánh ứng viên\nĐể tìm cực trị toàn cục trên miền đóng, bị chặn: tìm điểm dừng trong miền trong; khảo sát hàm trên từng cạnh hoặc đường biên bằng cách tham số hóa; kiểm tra góc, đầu mút và điểm không khả vi; cuối cùng tính và so sánh giá trị tại tất cả ứng viên. Hessian chỉ phân loại địa phương, không thay thế bước so sánh này.\n\n### Ví dụ trên hình vuông\nVới $f(x,y)=x^2+y^2$ trên $[-1,1]\\times[-1,1]$, điểm dừng trong miền là $(0,0)$, cho giá trị $0$. Trên biên, giá trị nhỏ nhất là $1$ tại trung điểm các cạnh và lớn nhất là $2$ tại bốn góc. Do đó min toàn cục bằng $0$ tại gốc, max toàn cục bằng $2$ tại các góc.",
        "workedExample": {
          "question": "Tìm max và min của $f(x,y)=x^2+y^2$ trên $[-1,1]\\times[-1,1]$.",
          "steps": [
            "Điểm dừng trong miền là $(0,0)$ và $f(0,0)=0$.",
            "Trên biên, $f$ nhỏ nhất bằng $1$ và lớn nhất bằng $2$; giá trị $2$ đạt tại bốn góc.",
            "So sánh các ứng viên: min toàn cục là $0$, max toàn cục là $2$."
          ]
        },
        "recall": {
          "front": "Vì sao điểm dừng chưa đủ để tìm cực trị toàn cục?",
          "back": "Giá trị lớn nhất hoặc nhỏ nhất có thể nằm trên biên hoặc tại góc; phải kiểm tra toàn bộ miền và so sánh ứng viên."
        },
        "trap": {
          "title": "Dùng kết luận địa phương thay cho toàn cục",
          "wrong": "Có cực tiểu địa phương nên đó là giá trị nhỏ nhất trên cả miền.",
          "right": "Khảo sát biên và so sánh giá trị hàm tại toàn bộ ứng viên.",
          "explanation": "Một điểm khác trên biên có thể cho giá trị nhỏ hơn hoặc lớn hơn."
        }
      }
    }
  },
  "9": {
    "order": [
      "section-1",
      "section-2",
      "section-3",
      "budget-constraint"
    ],
    "removed": [],
    "sections": {
      "section-3": {
        "title": "Nhân tử Lagrange và tỷ lệ tác động biên",
        "conditions": "Diễn giải tại nghiệm nội bộ của bài toán tối ưu có một ràng buộc đẳng thức, với các đạo hàm dùng làm mẫu khác $0$.",
        "definition": "Từ hệ $f_x-\\lambda g_x=0$ và $f_y-\\lambda g_y=0$ suy ra\n$$\n\\frac{f_x}{g_x}=\\frac{f_y}{g_y}=\\lambda\n$$\nkhi $g_x,g_y\\ne0$.",
        "content": "Mỗi tỷ số so sánh tác động biên của mục tiêu với tác động biên của ràng buộc theo một biến. Hai tỷ số bằng nhau vì ở nghiệm tối ưu, thay đổi khả thi nhỏ không thể làm mục tiêu tăng ở bậc nhất.\n\n### Ứng dụng: tối thiểu hóa chi phí để đạt sản lượng\n\nVới chi phí $C=wL+rK$ và ràng buộc sản lượng $Q_0-Q(L,K)=0$, đặt\n$$\n\\mathcal L=C+\\lambda(Q_0-Q)\n$$\nĐiều kiện dừng cho $w-\\lambda Q_L=0$ và $r-\\lambda Q_K=0$. Khi các đại lượng khác $0$,\n$$\n\\frac{Q_L}{Q_K}=\\frac{w}{r}\n$$\nTại nghiệm nội bộ, sản phẩm biên trên một đơn vị chi phí được cân bằng. Đây là kết quả của mô hình và giả thiết đang xét, không phải tỷ lệ đúng cho mọi bài toán.",
        "workedExample": {
          "question": "Với $C=wL+rK$ và ràng buộc $Q_0-Q(L,K)=0$, tìm quan hệ giữa sản phẩm biên và giá đầu vào tại nghiệm nội bộ.",
          "steps": [
            "Lập $\\mathcal L=wL+rK+\\lambda(Q_0-Q)$.",
            "Điều kiện dừng: $w-\\lambda Q_L=0$ và $r-\\lambda Q_K=0$.",
            "Chia hai phương trình được $Q_L/Q_K=w/r$, tương đương $Q_L/w=Q_K/r$."
          ],
          "casioTip": "Tỷ lệ chỉ suy ra tại nghiệm nội bộ và khi phép chia hợp lệ; vẫn cần thỏa hàm sản xuất cùng ràng buộc."
        },
        "recall": {
          "front": "Điều kiện Lagrange cân bằng các tác động biên nào?",
          "back": "Với $L=f+\\lambda(c-g)$, ta có $f_x/g_x=f_y/g_y=\\lambda$ khi các mẫu khác $0$."
        },
        "trap": {
          "title": "Dùng tỷ lệ biên ngoài giả thiết",
          "wrong": "Tỷ lệ hai đạo hàm riêng luôn bằng tỷ lệ giá đầu vào.",
          "right": "Tỷ lệ cụ thể phụ thuộc hàm mục tiêu, ràng buộc và điều kiện nghiệm nội bộ.",
          "explanation": "Quan hệ $Q_L/Q_K=w/r$ là hệ quả của đúng bài toán tối thiểu hóa chi phí đã nêu."
        }
      },
      "budget-constraint": {
        "title": "Ràng buộc đẳng thức và miền khả thi",
        "conditions": "Phân biệt điều kiện $c-g(x,y)=0$ với bất đẳng thức $c-g(x,y)\\ge0$.",
        "definition": "Ràng buộc đẳng thức đặt nghiệm trên đường biên. Với bất đẳng thức, miền khả thi còn có thể chứa các điểm nằm phía trong.",
        "content": "Nếu điều kiện là $g(x,y)\\le c$, có thể viết $c-g(x,y)\\ge0$. Khi $c-g=0$, ràng buộc đang hoạt động và bài toán nằm trên biên; khi $c-g>0$, điểm còn ở phía trong miền. Không tự thay bất đẳng thức bằng đẳng thức nếu chưa biết nghiệm chạm biên.\n\nHệ Lagrange và Hessian $H_2$ ở chương này áp dụng cho một ràng buộc đẳng thức trơn tại điểm chính quy. Bài toán bất đẳng thức cần xét riêng khả năng ràng buộc hoạt động hay không hoạt động.",
        "recall": {
          "front": "Khi nào được thay $g(x,y)le c$ bằng $g(x,y)=c$?",
          "back": "Khi đã xác định nghiệm nằm trên biên, tức $c-g(x,y)=0$. Nếu còn ở phía trong thì bất đẳng thức chưa hoạt động."
        },
        "trap": {
          "title": "Giả sử giới hạn luôn chạm biên",
          "wrong": "Với $g(x,y)le c$, luôn lập hệ như $g(x,y)=c$.",
          "right": "Kiểm tra nghiệm có chạm biên hay không; nếu bất đẳng thức còn lỏng, bài toán khác với tối ưu trên đường biên.",
          "explanation": "Một điểm có thể thỏa bất đẳng thức nghiêm ngặt $c-g>0$ và vẫn là nghiệm tối ưu."
        }
      },
      "section-1": {
        "title": "Nhân tử Lagrange với ràng buộc $c-g(x,y)=0$",
        "conditions": "Xét cực trị của $f(x,y)$ với ràng buộc trơn $c-g(x,y)=0$, trong đó $c>0$. Tại ứng viên chính quy cần $\\nabla g=(g_x,g_y)\\ne(0,0)$.",
        "definition": "Theo quy ước bài giảng, đặt\n$$\nL(x,y,\\lambda)=f(x,y)+\\lambda\\bigl(c-g(x,y)\\bigr)\n$$\nỨng viên dừng thỏa\n$$\nf_x-\\lambda g_x=0,\\qquad\nf_y-\\lambda g_y=0,\\qquad\nc-g(x,y)=0\n$$",
        "content": "### Vì sao gradient của mục tiêu song song với gradient ràng buộc?\n\nTrên đường $g(x,y)=c$, chỉ những dịch chuyển tiếp tuyến mới còn nằm trong tập khả thi. Gọi $t$ là một vectơ tiếp tuyến; khi đó $\\nabla g\\cdot t=0$. Tại cực trị có điều kiện, mục tiêu cũng không đổi ở bậc nhất theo hướng ấy, nên $\\nabla f\\cdot t=0$. Hai gradient cùng vuông góc với tiếp tuyến, do đó song song:\n$$\n\\nabla f=\\lambda\\nabla g\n$$\nDấu của $\\lambda$ theo đúng quy ước $L=f+\\lambda(c-g)$ dẫn đến hai phương trình dừng ở trên.\n\n### Ví dụ: tối đa hóa tích với tổng cố định\n\nTìm ứng viên cực trị của $f(x,y)=xy$ với $10-x-y=0$ và $x,y\\ge0$. Ta có $c=10>0$, $g(x,y)=x+y$ và $\\nabla g=(1,1)\\ne(0,0)$. Giải hệ điều kiện dừng cho $x=y=\\lambda=5$.",
        "workedExample": {
          "question": "Lập hệ Lagrange và tìm ứng viên cực trị của $f(x,y)=xy$ với điều kiện $10-x-y=0$, $x,y\\ge0$.",
          "steps": [
            "Đặt $g(x,y)=x+y$ và $c=10$. Ràng buộc đúng theo quy ước là $c-g=10-x-y=0$.",
            "Lập $L=xy+\\lambda(10-x-y)$.",
            "Điều kiện dừng là $y-\\lambda=0$, $x-\\lambda=0$, $10-x-y=0$.",
            "Suy ra $x=y=5$ và $\\lambda=5$; đây mới là ứng viên, cần xét cấp hai hoặc so sánh trên tập khả thi."
          ],
          "casioTip": "Không bỏ phương trình ràng buộc. Hai phương trình đạo hàm riêng tự chúng chưa bảo đảm điểm nằm trên tập khả thi."
        },
        "recall": {
          "front": "Với quy ước $L=f+\\lambda(c-g)$, hệ Lagrange gồm những phương trình nào?",
          "back": "$f_x-\\lambda g_x=0$, $f_y-\\lambda g_y=0$ và $c-g(x,y)=0$. Kiểm tra thêm $c>0$ và tính chính quy của ràng buộc."
        },
        "trap": {
          "title": "Dùng sai dấu của ràng buộc",
          "wrong": "Viết $L=f+\\lambda(g-c)$ nhưng lại dùng phương trình $f_x-\\lambda g_x=0$.",
          "right": "Giữ nhất quán: với $L=f+\\lambda(c-g)$, ta có $L_x=f_x-\\lambda g_x$, $L_y=f_y-\\lambda g_y$ và $L_\\lambda=c-g$.",
          "explanation": "Có thể chọn quy ước dấu khác, nhưng phải dùng cùng một quy ước trong toàn bộ hệ."
        }
      },
      "section-2": {
        "title": "Một Hessian $H_2$ để xét độ cong có điều kiện",
        "conditions": "Dùng tại ứng viên dừng chính quy, với $g_x^2+g_y^2\\ne0$ và các đạo hàm cấp hai cần thiết liên tục.",
        "definition": "Với $L=f+\\lambda(c-g)$, lập ma trận Hessian biên theo thứ tự biến $(x,y,\\lambda)$:\n$$\nH_2=\n\\begin{pmatrix}\nL_{xx}&L_{xy}&L_{x\\lambda}\\\\\nL_{yx}&L_{yy}&L_{y\\lambda}\\\\\nL_{\\lambda x}&L_{\\lambda y}&L_{\\lambda\\lambda}\n\\end{pmatrix}\n$$\nTa xét dấu định thức $|H_2|$. Tại điểm dừng chính quy, $|H_2|>0$ cho cực đại địa phương có điều kiện; $|H_2|<0$ cho cực tiểu địa phương có điều kiện. Nếu $|H_2|=0$, tiêu chuẩn này chưa kết luận.",
        "content": "### Chứng minh công thức theo đúng quy ước $c-g$\n\nTừ $L=f+\\lambda(c-g)$, ta có $L_{x\\lambda}=-g_x$, $L_{y\\lambda}=-g_y$ và $L_{\\lambda\\lambda}=0$. Do đó, định thức vừa nêu có dạng\n$$\n|H_2|=\n\\begin{vmatrix}\nL_{xx}&L_{xy}&-g_x\\\\\nL_{yx}&L_{yy}&-g_y\\\\\n-g_x&-g_y&0\n\\end{vmatrix}\n$$\nĐưa hàng cuối lên đầu rồi đưa cột cuối sang đầu; hai phép đổi chỗ làm hai dấu âm triệt tiêu. Tiếp theo, nhân hàng đầu và cột đầu với $-1$; hai lần đổi dấu này cũng không làm đổi định thức:\n$$\n|H_2|=\n\\begin{vmatrix}\n0&g_x&g_y\\\\\ng_x&L_{xx}&L_{xy}\\\\\ng_y&L_{yx}&L_{yy}\n\\end{vmatrix}\n$$\nVì $L_{xy}=L_{yx}$, khai triển theo hàng đầu cho\n$$\n|H_2|=\n-\\left(g_y^2L_{xx}-2g_xg_yL_{xy}+g_x^2L_{yy}\\right)\n=-Q\n$$\nBiểu thức trong ngoặc là độ cong bậc hai của $L$ theo hướng tiếp tuyến với đường ràng buộc. Vì thế dấu của $|H_2|$ ngược dấu với độ cong: dương cho cực đại địa phương, âm cho cực tiểu địa phương. Đây là tiêu chuẩn địa phương; dấu bằng $0$ thì phải khảo sát trực tiếp.\n\n### Kiểm tra trên cùng ví dụ\n\nVới $f=xy$, $g=x+y$, $c=10$ và ứng viên $(5,5,5)$, hàm Lagrange là $L=xy+\\lambda(10-x-y)$. Khi đó $L_{xx}=L_{yy}=0$, $L_{xy}=L_{yx}=1$, $L_{x\\lambda}=L_{y\\lambda}=-1$. Suy ra\n$$\n|H_2|=\n\\begin{vmatrix}\n0&1&-1\\\\\n1&0&-1\\\\\n-1&-1&0\n\\end{vmatrix}\n=2>0\n$$\nVậy $(5,5)$ là cực đại địa phương có điều kiện. Trên toàn đoạn khả thi, $y=10-x$ nên $xy=x(10-x)=25-(x-5)^2\\le25$; do đó đây còn là cực đại toàn cục trên miền $x,y\\ge0$.",
        "workedExample": {
          "question": "Dùng một định thức $H_2$ để phân loại ứng viên $(5,5)$ của $f(x,y)=xy$ với $10-x-y=0$, $x,y\\ge0$.",
          "steps": [
            "Từ $L=xy+\\lambda(10-x-y)$, tại $(5,5,5)$ có $L_{xx}=L_{yy}=0$, $L_{xy}=L_{yx}=1$, $L_{x\\lambda}=L_{y\\lambda}=-1$ và $L_{\\lambda\\lambda}=0$.",
            "Thay các đạo hàm vào định thức $H_2$ cho $|H_2|=2$.",
            "Vì định thức dương, ứng viên là cực đại địa phương có điều kiện.",
            "Trên tập khả thi, $xy=25-(x-5)^2\\le25$, nên giá trị $25$ còn là cực đại toàn cục."
          ],
          "casioTip": "Dùng đúng đạo hàm của hàm Lagrange đã lập. Kiểm tra dấu định thức theo quy ước đang dùng trước khi kết luận."
        },
        "recall": {
          "front": "Với định nghĩa $H_2$ từ ma trận đạo hàm của $L(x,y,\\lambda)$, dấu nào ứng với cực đại?",
          "back": "Tại ứng viên chính quy, $|H_2|>0$ cho cực đại địa phương; $|H_2|<0$ cho cực tiểu địa phương; bằng $0$ thì chưa kết luận."
        },
        "trap": {
          "title": "Đảo dấu tiêu chuẩn Hessian biên",
          "wrong": "Kết luận định thức dương là cực tiểu như trong phép thử Hessian không ràng buộc.",
          "right": "Với định nghĩa $H_2$ của chương này, định thức dương cho cực đại địa phương có điều kiện.",
          "explanation": "Chứng minh $|H_2|=-Q$ cho thấy dấu định thức ngược với độ cong theo hướng tiếp tuyến."
        }
      }
    },
    "summary": "Với bài toán cực trị có một ràng buộc đẳng thức $c-g(x,y)=0$, $c>0$, chương xây dựng hệ Lagrange, kiểm tra một Hessian $H_2$ theo đúng quy ước bài giảng và phân biệt kết luận địa phương với toàn cục.",
    "objectives": [
      "Thiết lập hàm Lagrange và hệ điều kiện dừng cho ràng buộc $c-g(x,y)=0$, $c>0$.",
      "Giải thích điều kiện bậc nhất qua các hướng khả thi trên đường ràng buộc.",
      "Tính định thức duy nhất $H_2$, hiểu chứng minh liên hệ với độ cong tiếp tuyến và dùng dấu đúng tại điểm chính quy.",
      "Phân biệt tiêu chuẩn cực trị địa phương với việc so sánh để kết luận toàn cục."
    ]
  }
};
