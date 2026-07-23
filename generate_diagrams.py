import os
import numpy as np
import matplotlib.pyplot as plt

# Set font family to serif (LaTeX style)
plt.rcParams['font.family'] = 'serif'
plt.rcParams['font.size'] = 11
plt.rcParams['axes.edgecolor'] = '#334155'
plt.rcParams['axes.linewidth'] = 1.2

output_dir = r"c:\Users\ADMIN\Downloads\WEB_TCC\frontend\public\images"

# -------------------------------------------------------------
# 1. MC & AC Curve Diagram
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 5), dpi=300)

q = np.linspace(1, 10, 300)
# AC(q) = q^2 - 6q + 15 + 100/q ... simplified smooth model
# AC = 0.5*(q-5)**2 + 4
ac = 0.4 * (q - 5)**2 + 4
# MC = derivative of total cost = d(q*AC)/dq = ac + q*ac' = 0.4*(q-5)^2 + 4 + q*0.8*(q-5)
mc = 0.4 * (q - 5)**2 + 4 + q * 0.8 * (q - 5)

ax.plot(q, ac, label=r'Average Cost ($AC$)', color='#0284c7', lw=2.5)
ax.plot(q, mc, label=r'Marginal Cost ($MC$)', color='#dc2626', lw=2.5)

# Intersection at q = 5, AC = 4
ax.plot(5, 4, 'o', color='#15803d', markersize=8, zorder=5)
ax.vlines(5, 0, 4, colors='#64748b', linestyles='dashed', lw=1.2)
ax.hlines(4, 0, 5, colors='#64748b', linestyles='dashed', lw=1.2)

ax.annotate(r'Bottom Point: $MC = AC$', xy=(5, 4), xytext=(5.8, 5.5),
            arrowprops=dict(facecolor='#15803d', shrink=0.08, width=1.5, headwidth=7),
            fontsize=12, fontweight='bold', color='#15803d')

ax.set_xlim(0, 9.5)
ax.set_ylim(0, 10)
ax.set_xlabel(r'Sản lượng ($q$)', fontsize=12, labelpad=8)
ax.set_ylabel(r'Chi phí ($C, MC, AC$)', fontsize=12, labelpad=8)
ax.set_title(r'Đồ thị Quy tắc điểm đáy: Đường $MC$ cắt đường $AC$ tại $\min(AC)$', fontsize=13, fontweight='bold', pad=12)

# Set custom ticks
ax.set_xticks([5])
ax.set_xticklabels([r'$q^*$ ($\min AC$)'])
ax.set_yticks([4])
ax.set_yticklabels([r'$AC_{\min}$'])

ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.grid(True, linestyle=':', alpha=0.5)
ax.legend(frameon=True, facecolor='#ffffff', edgecolor='#cbd5e1', loc='upper right')

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'mc_ac_diagram.svg'), format='svg')
plt.close()

# -------------------------------------------------------------
# 2. MPL & APL Curve Diagram
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 5), dpi=300)

L = np.linspace(0.1, 10, 300)
# APL = -0.3*(L-5)**2 + 6
apl = -0.3 * (L - 5)**2 + 6
# MPL = derivative of Q = APL + L*APL' = apl - 0.6*L*(L-5)
mpl = apl - 0.6 * L * (L - 5)

ax.plot(L, apl, label=r'Năng suất trung bình ($AP_L$)', color='#7c3aed', lw=2.5)
ax.plot(L, mpl, label=r'Năng suất biên ($MP_L$)', color='#16a34a', lw=2.5)

# Intersection at L = 5, APL = 6
ax.plot(5, 6, 'o', color='#0f766e', markersize=8, zorder=5)
ax.vlines(5, 0, 6, colors='#64748b', linestyles='dashed', lw=1.2)
ax.hlines(6, 0, 5, colors='#64748b', linestyles='dashed', lw=1.2)

ax.annotate(r'Cực đại: $MP_L = AP_L$', xy=(5, 6), xytext=(5.8, 7.2),
            arrowprops=dict(facecolor='#0f766e', shrink=0.08, width=1.5, headwidth=7),
            fontsize=12, fontweight='bold', color='#0f766e')

ax.set_xlim(0, 9.5)
ax.set_ylim(0, 9)
ax.set_xlabel(r'Lao động ($L$)', fontsize=12, labelpad=8)
ax.set_ylabel(r'Năng suất ($AP_L, MP_L$)', fontsize=12, labelpad=8)
ax.set_title(r'Đồ thị Năng suất biên $MP_L$ cắt $AP_L$ tại điểm cực đại $\max(AP_L)$', fontsize=13, fontweight='bold', pad=12)

ax.set_xticks([5])
ax.set_xticklabels([r'$L^*$ ($\max AP_L$)'])
ax.set_yticks([6])
ax.set_yticklabels([r'$AP_{L,\max}$'])

ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.grid(True, linestyle=':', alpha=0.5)
ax.legend(frameon=True, facecolor='#ffffff', edgecolor='#cbd5e1', loc='upper right')

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'mpl_apl_diagram.svg'), format='svg')
plt.close()

# -------------------------------------------------------------
# 3. Elasticity & Amoroso-Robinson Diagram
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 5), dpi=300)

Q = np.linspace(0, 10, 300)
# p(Q) = 10 - Q
p = 10 - Q
# MR = 10 - 2Q
mr = 10 - 2 * Q

ax.plot(Q, p, label=r'Đường cầu $p(Q)$', color='#2563eb', lw=2.5)
ax.plot(Q, mr, label=r'Doanh thu biên $MR(Q)$', color='#dc2626', lw=2.5)
ax.axhline(0, color='#334155', lw=1.2)

# Midpoint Q = 5, mr = 0
ax.plot(5, 0, 'o', color='#15803d', markersize=8, zorder=5)
ax.vlines(5, 0, 5, colors='#64748b', linestyles='dashed', lw=1.2)

# Shaded regions
ax.text(2.2, 3, r'$|E_p| > 1 \Rightarrow MR > 0$' + '\n(Cầu co giãn nhiều)', fontsize=11, fontweight='bold', color='#1e40af', bbox=dict(boxstyle='round,pad=0.5', facecolor='#eff6ff', edgecolor='#bfdbfe'))
ax.text(6.2, 2, r'$|E_p| < 1 \Rightarrow MR < 0$' + '\n(Cầu ít co giãn)', fontsize=11, fontweight='bold', color='#991b1b', bbox=dict(boxstyle='round,pad=0.5', facecolor='#fef2f2', edgecolor='#fecaca'))

ax.set_xlim(0, 10)
ax.set_ylim(-2, 11)
ax.set_xlabel(r'Sản lượng ($Q$)', fontsize=12, labelpad=8)
ax.set_ylabel(r'Giá $p$ / Doanh thu biên $MR$', fontsize=12, labelpad=8)
ax.set_title(r'Đồ thị Amoroso-Robinson: Mối quan hệ giữa $p$, $MR$ và Co giãn $E_p$', fontsize=13, fontweight='bold', pad=12)

ax.set_xticks([5])
ax.set_xticklabels([r'$Q_0$ ($|E_p|=1, MR=0$)'])

ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.grid(True, linestyle=':', alpha=0.5)
ax.legend(frameon=True, facecolor='#ffffff', edgecolor='#cbd5e1', loc='upper right')

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'elasticity_mr_diagram.svg'), format='svg')
plt.close()

# -------------------------------------------------------------
# 4. Income Saving Flow Diagram
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 4.5), dpi=300)
ax.axis('off')

# Title
ax.text(0.5, 0.92, 'SƠ ĐỒ CHU CHUYỂN VĨ MÔ: THU NHẬP (Y), TIÊU DÙNG (C) & TIẾT KIỆM (S)',
        fontsize=13, fontweight='bold', ha='center', va='center', color='#0f172a')
ax.text(0.5, 0.84, r'Đẳng thức phân bổ $Y = C(Y) + S(Y)$ và $MPC + MPS = 1$',
        fontsize=11, ha='center', va='center', color='#64748b')

# Nodes
ax.text(0.2, 0.5, 'THU NHẬP\nQUỐC DÂN (Y)', fontsize=13, fontweight='bold', ha='center', va='center',
        bbox=dict(boxstyle='round,pad=0.8', facecolor='#f0fdf4', edgecolor='#16a34a', lw=2))

ax.text(0.8, 0.68, 'TIÊU DÙNG (C)\n' + r'$MPC = \frac{\mathrm{d}C}{\mathrm{d}Y}$', fontsize=12, fontweight='bold', ha='center', va='center',
        bbox=dict(boxstyle='round,pad=0.8', facecolor='#f0f9ff', edgecolor='#0284c7', lw=2))

ax.text(0.8, 0.32, 'TIẾT KIỆM (S)\n' + r'$MPS = \frac{\mathrm{d}S}{\mathrm{d}Y} = 1 - MPC$', fontsize=12, fontweight='bold', ha='center', va='center',
        bbox=dict(boxstyle='round,pad=0.8', facecolor='#fffbeb', edgecolor='#d97706', lw=2))

# Arrows
ax.annotate('', xy=(0.65, 0.68), xytext=(0.33, 0.54),
            arrowprops=dict(arrowstyle='->', lw=2.5, color='#0284c7'))
ax.annotate('', xy=(0.65, 0.32), xytext=(0.33, 0.46),
            arrowprops=dict(arrowstyle='->', lw=2.5, color='#d97706'))

# Bottom Formula
ax.text(0.5, 0.1, r'SỐ NHÂN ĐẦU TƯ: $k = \frac{\mathrm{d}Y}{\mathrm{d}I} = \frac{1}{1 - MPC} = \frac{1}{MPS}$',
        fontsize=12, fontweight='bold', ha='center', va='center',
        bbox=dict(boxstyle='square,pad=0.6', facecolor='#f8fafc', edgecolor='#cbd5e1', lw=1.5))

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'income_saving_diagram.svg'), format='svg')
plt.close()

print("All 4 LaTeX Matplotlib SVG diagrams successfully generated!")
