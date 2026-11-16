import { parse } from '@babel/parser';
import { readFile, writeFile } from 'node:fs/promises';
const R=String.raw;
const pairs=[
 ['kaᵢⱼ',R`$ka_{ij}$`],['kⁿ',R`$k^n$`],['$(-1)$ⁱ⁺ʲ',R`$(-1)^{i+j}$`],['AA⁻¹=I',R`$AA^{-1}=I$`],['A⁻¹',R`$A^{-1}$`],
 [R`B=[$B_{1}$ … Bₚ], X=[$X_{1}$ … Xₚ]`,R`$B=[B_1\ \cdots\ B_p]$, $X=[X_1\ \cdots\ X_p]$`],
 [R`$B=$kA⁻¹`,R`$B=kA^{-1}$`],[R`$B=$k$A^{-1}$`,R`$B=kA^{-1}$`],[R`$BA=$kI`,R`$BA=kI$`],
 ['dấu ≤ bằng =',R`dấu $\le$ bằng $=$`],
 [R`Nếu Xₚ giải $AX=B$, mọi nghiệm của hệ có dạng $X=$Xₚ+Xₕ với AXₕ=0: từ $AX=B$ suy A($X-$Xₚ)=0`,R`Nếu $X_p$ giải $AX=B$, mọi nghiệm của hệ có dạng $X=X_p+X_h$ với $AX_h=0$: từ $AX=B$ suy $A(X-X_p)=0$`],
 ['3×3',R`$3\times3$`],['aᵢⱼ',R`$a_{ij}$`],['a₀ⱼ',R`$a_{0j}$`],['Dᵢ',R`$D_i$`],['Δy',R`$\Delta y$`],['LΔD',R`$L\Delta D$`],['LD′',R`$LD'$`],
 [R`$LD'$ là $X'; L(D'-D)$`,R`$LD'$ là $X'$; $L(D'-D)$`],
 [R`$\varepsilon =$pq′/q`,R`$\varepsilon=pq'/q$`],[R`$R=$pq`,R`$R=pq$`],['−$\\varepsilon$',R`$-\varepsilon$`],
 [R`$\varepsilon =-$xFₓ/(yFᵧ)`,R`$\varepsilon=-xF_x/(yF_y)$`],
 [R`$\Delta y/y$≈εΔx/x=(−$1/2$)(−2%)=+1%`,R`$\Delta y/y\approx\varepsilon\Delta x/x=(-1/2)(-2\%)=1\%$`],
 [R`$dz/dt=$fᵤu′+fᵥv′`,R`$dz/dt=f_uu'+f_vv'$`],[R`$dz/dt=$fᵤu′`,R`$dz/dt=f_uu'$`],
 [R`$z=$cxᵃyᵇ`,R`$z=cx^ay^b$`],[R`$f_{x}=$af/x`,R`$f_x=af/x$`],[R`$f_{y}=$bf/y`,R`$f_y=bf/y$`],
 [R`$(2/3)\cdot 6$%+($1/3$)·(−12%)=0`,R`$(2/3)\cdot6\%+(1/3)\cdot(-12\%)=0$`],
 [R`$\Delta z/z$≈aΔx/$x+$bΔy/y`,R`$\Delta z/z\approx a\Delta x/x+b\Delta y/y$`],
 [R`$Q=\nabla ^{2}$₍ₓ,ᵧ₎L`,R`$Q=\nabla^2_{(x,y)}L$`],['dấu = hoặc ≤',R`dấu $=$ hoặc $\le$`],
 [R`$A(b)=$∫₀ᵇx²dx=$F(b)-F(0)=b^{3}/3$`,R`$A(b)=\int_0^b x^2\,dx=F(b)-F(0)=b^3/3$`],
 [R`$\mu '=$pμ`,R`$\mu'=p\mu$`],
 [R`p=2/x, μ=e^(∫$2 dx/x$)=$x^{2}$`,R`$p=2/x$, $\mu=e^{\int(2/x)\,dx}=x^2$`],
 ['μ=e^(∫p dx)',R`$\mu=e^{\int p\,dx}$`],
 [R`($\mu y$)′=μy′+μ′y=μ($y'+$py)`,R`$(\mu y)'=\mu y'+\mu'y=\mu(y'+py)$`],
 ['hệ số y′',R`hệ số $y'$`],
 [R`∫$u dv=uv-$∫v du`,R`$\int u\,dv=uv-\int v\,du$`],['2xe²ˣ',R`$2xe^{2x}$`],
 [R`∫$\mu q$`,R`$\int\mu q\,dx$`],[R`∫$e^{2x}dx=e^{2x}+C$`,R`$\int e^{2x}\,dx=e^{2x}+C$`],[R`∫$e^{2x}dx=e^{2x}/2+C$`,R`$\int e^{2x}\,dx=e^{2x}/2+C$`],
 [R`$N'=$kN`,R`$N'=kN$`],['năm⁻¹',R`$\text{nam}^{-1}$`],['tháng⁻¹',R`$\text{thang}^{-1}$`],
 [R`$k=ln2/10$`,R`$k=\ln2/10$`],['N₂/N₁=e^(kΔt)',R`$N_2/N_1=e^{k\Delta t}$`],
 [R`$Q=$AKᵅL¹⁻ᵅ, $A>0, 0<\alpha <1; K'=$sQ−$\delta K, L'=$nL, $0<s<1, n,\delta \ge 0$`,R`$Q=AK^\alpha L^{1-\alpha}$, $A>0$, $0<\alpha<1$; $K'=sQ-\delta K$, $L'=nL$, $0<s<1$, $n,\delta\ge0$`],
 [R`$Q/L=$Akᵅ`,R`$Q/L=Ak^\alpha$`],
 [R`$E'=s'-$sₑ′=$s'-\pi$`,R`$E'=s'-s_e'=s'-\pi$`],
 [R`μ=e^(∫2dx)=$e^{2x}$; nhân vào được $(e^{2x}y)'=2$xe²ˣ`,R`$\mu=e^{\int2\,dx}=e^{2x}$; nhân vào được $(e^{2x}y)'=2xe^{2x}$`],
];
const files=['foundationAlgebra.js','foundationAlgebraComplements.js','foundationCalculus.js','foundationOptimization.js','studyTextbook.js','reviewedAlgebra.js','reviewedSystems.js','reviewedInputOutput.js','reviewedCalculus.js','studyQuestions.js'];
for(const file of files){
 const path=new URL(`../src/data/${file}`,import.meta.url),source=await readFile(path,'utf8'),tree=parse(source,{sourceType:'module'}),edits=[];
 function fix(value){
  let s=value;for(const[from,to]of pairs)s=s.split(from).join(to);
  // Source descriptions use a typographic separator, not multiplication.
  if(s.startsWith('Ghi chép'))s=s.replace(/\$(\d+) \\cdot\$/g,'$1 ·');
  s=s.replace(/\$([^$\n]*)\$/g,(_,m)=>'$'+m.replace(/k\*/g,'k^*')+'$');
  return s;
 }
 function walk(n,p){if(!n||typeof n!=='object')return;
  if(n.type==='StringLiteral'){
   if(p?.type==='ImportDeclaration')return;
   const value=fix(n.value);if(value!==n.value)edits.push({start:n.start,end:n.end,text:JSON.stringify(value)});return;
  }
  if(n.type==='TemplateLiteral'){
   if(n.expressions.length)return;const raw=p?.type==='TaggedTemplateExpression',value=raw?n.quasis[0].value.raw:n.quasis[0].value.cooked,next=fix(value);
   if(next!==value)edits.push({start:n.start,end:n.end,text:raw?'`'+next+'`':JSON.stringify(next)});return;
  }
  for(const[k,v]of Object.entries(n))if(!['loc','start','end','extra'].includes(k)){if(Array.isArray(v))v.forEach(x=>walk(x,n));else if(v&&typeof v==='object')walk(v,n);}
 }
 walk(tree);let updated=source;for(const e of edits.sort((a,b)=>b.start-a.start))updated=updated.slice(0,e.start)+e.text+updated.slice(e.end);await writeFile(path,updated);
}
