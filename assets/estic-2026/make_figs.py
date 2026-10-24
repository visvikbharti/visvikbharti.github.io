import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy import stats
BG, INK, INK2, GRID, NEU = "#000000", "#f2ede3", "#a8a29a", "#2a2a2a", "#5c5c5c"
GREEN, CORAL = "#2aa86f", "#e05a44"
plt.rcParams.update({"figure.facecolor":BG,"axes.facecolor":BG,"savefig.facecolor":BG,"text.color":INK,
  "axes.labelcolor":INK2,"xtick.color":INK2,"ytick.color":INK2,"axes.edgecolor":GRID,"font.family":"DejaVu Sans",
  "font.size":13,"axes.spines.top":False,"axes.spines.right":False})
def frame(title, source, size=(8,5)):
    fig, ax = plt.subplots(figsize=size, dpi=200)
    fig.subplots_adjust(top=0.84, bottom=0.2)
    fig.text(0.04, 0.93, title, fontsize=16, fontweight="bold", color=INK, ha="left")
    fig.text(0.04, 0.035, source, fontsize=10, color=INK2, ha="left")
    return fig, ax
def save(fig, name): fig.savefig(name, dpi=200); plt.close(fig)

# 1 Audit shares (poster numbers, pooled 23,000)
cats = ["p-value and test named,\nno statistic value","No inferential statistics","Only estimates and\nconfidence intervals","Incomplete or unpaired\nreporting","Statistic, df and p:\ncheckable"]
vals = [39.70, 27.72, 18.03, 10.07, 4.49]
fig, ax = frame("What 23,000 biomedical articles printed", "Source: our audit of 23,000 randomly selected open-access articles from PubMed Central (pooled samples).")
fig.subplots_adjust(left=0.33, right=0.95)
y = np.arange(len(cats))[::-1]
ax.barh(y, vals, color=[NEU]*4+[GREEN], height=0.62)
for yi, v in zip(y, vals): ax.text(v+0.8, yi, f"{v:.2f}%", va="center", fontsize=12, color=INK)
ax.set_yticks(y, cats, fontsize=11.5); ax.set_xlim(0, 46); ax.set_xticks([0,10,20,30,40], ["0%","10%","20%","30%","40%"])
ax.tick_params(axis="y", length=0); ax.grid(axis="x", color=GRID, lw=0.8); ax.set_axisbelow(True)
save(fig, "fig1_audit_shares.png")

# 2 RECOVERY forest plot (NEJM abstract values)
rows = [("Invasive mechanical ventilation",0.64,0.51,0.81),("Oxygen only",0.82,0.72,0.94),("No respiratory support",1.19,0.92,1.55),("All patients",0.83,0.75,0.93)]
fig, ax = frame("Dexamethasone in COVID-19: the RECOVERY trial", "Source: RECOVERY Collaborative Group, N Engl J Med 2021;384:693-704.\nRate ratio for death within 28 days, with 95% confidence interval.")
fig.subplots_adjust(left=0.36, right=0.74, bottom=0.25)
for i,(lab,rr,lo,hi) in enumerate(rows):
    yy = len(rows)-1-i
    ax.plot([lo,hi],[yy,yy], color=INK, lw=2)
    if lab=="All patients": ax.scatter([rr],[yy], marker="D", s=110, color=GREEN, zorder=3)
    else: ax.scatter([rr],[yy], marker="s", s=70, color=INK, zorder=3)
    ax.text(1.02, yy, f"{rr:.2f} ({lo:.2f} to {hi:.2f})", transform=ax.get_yaxis_transform(), va="center", fontsize=11.5, color=INK)
ax.axvline(1, color=INK2, ls="--", lw=1)
ax.set_xscale("log"); ax.set_xlim(0.45, 1.8); ax.set_xticks([0.5,0.75,1,1.25,1.5]); ax.set_xticklabels(["0.5","0.75","1","1.25","1.5"])
ax.minorticks_off(); ax.set_yticks(range(len(rows)), [r[0] for r in rows][::-1], fontsize=11.5); ax.tick_params(axis="y", length=0)
ax.set_xlabel("Rate ratio (log scale)")
ax.text(0.96, -0.95, "Favours dexamethasone", ha="right", fontsize=10.5, color=INK2); ax.text(1.04, -0.95, "Favours usual care", ha="left", fontsize=10.5, color=INK2)
ax.set_ylim(-1.2, len(rows)-0.5)
save(fig, "fig2_recovery_forest.png")

# 3 t distribution, t(38) = 2.31
df, t0 = 38, 2.31
p = 2*stats.t.sf(t0, df); crit = stats.t.ppf(0.975, df)
x = np.linspace(-4.5, 4.5, 900); d = stats.t.pdf(x, df)
fig, ax = frame("Recomputing p from t(38) = 2.31", f"Computed from the t distribution with {df} degrees of freedom (SciPy). Two-sided p = {p:.4f}.")
ax.plot(x, d, color=INK, lw=2)
for side in (1,-1):
    m = side*x >= t0; ax.fill_between(x[m], d[m], color=GREEN, alpha=0.9)
    ax.axvline(side*crit, color=INK2, ls="--", lw=1)
ax.annotate(f"each tail {p/2*100:.2f}%", xy=(2.9, 0.012), xytext=(3.0, 0.12), fontsize=11.5, color=INK, arrowprops=dict(arrowstyle="-", color=INK2))
ax.text(0, 0.03, f"two-sided p = {p:.4f}", ha="center", fontsize=12, color=INK)
ax.text(crit+0.05, 0.36, f"5% critical value\n±{crit:.2f}", fontsize=10.5, color=INK2)
ax.text(t0+0.05, 0.06, "t = 2.31", ha="left", fontsize=11, color=GREEN)
ax.set_ylim(0, 0.43); ax.set_yticks([]); ax.spines["left"].set_visible(False); ax.set_xlabel("Test statistic t")
save(fig, "fig3_t_distribution.png")

# 4 Student vs Welch (values from the page's simulation)
ratio = [1,2,3,4]
student = [0.05035,0.182775,0.2569,0.29225]; welch = [0.051375,0.0513,0.05095,0.049475]
fig, ax = frame("False positives when there is no real difference", "Simulation: 10 vs 40 observations, 40,000 runs per ratio, alpha = 0.05. Code on this page.")
fig.subplots_adjust(right=0.78)
ax.axhline(5, color=INK2, ls="--", lw=1); ax.text(1.12, 2.0, "expected 5%", fontsize=10.5, color=INK2)
ax.plot(ratio, [s*100 for s in student], color=CORAL, lw=2, marker="o", ms=8)
ax.plot(ratio, [w*100 for w in welch], color=GREEN, lw=2, marker="s", ms=8)
ax.text(4.08, student[-1]*100, f"Student's t-test\n{student[-1]*100:.1f}%", va="center", fontsize=11.5, color=INK)
ax.text(4.08, welch[-1]*100+0.4, f"Welch's t-test\n{welch[-1]*100:.1f}%", va="center", fontsize=11.5, color=INK)
ax.set_xticks(ratio, ["same","2x","3x","4x"]); ax.set_xlim(0.85, 4.05); ax.set_ylim(0, 35)
ax.set_yticks([0,10,20,30], ["0%","10%","20%","30%"]); ax.grid(axis="y", color=GRID, lw=0.8); ax.set_axisbelow(True)
ax.set_xlabel("SD of the small group relative to the large group")
save(fig, "fig4_student_vs_welch.png")

# 5 Turner 2008
fig, ax = frame("Antidepressant trials that looked positive", "Source: Turner et al., N Engl J Med 2008;358:252-260. 74 trials registered with the US FDA.")
fig.subplots_adjust(left=0.12, right=0.92)
labs = ["By the FDA's analysis","In the published literature"]; v = [51, 94]
ax.bar(labs, v, color=[NEU, CORAL], width=0.5)
for i,val in enumerate(v): ax.text(i, val+2, f"{val}%", ha="center", fontsize=14, fontweight="bold", color=INK)
ax.set_ylim(0, 105); ax.set_yticks([0,25,50,75,100], ["0%","25%","50%","75%","100%"]); ax.grid(axis="y", color=GRID, lw=0.8); ax.set_axisbelow(True)
ax.tick_params(axis="x", length=0, labelsize=12, labelcolor=INK)
save(fig, "fig5_turner_publication_bias.png")

# 6 Reinhart and Rogoff
fig, ax = frame("Growth in countries with public debt above 90% of GDP", "Sources: Reinhart and Rogoff, Am Econ Rev 2010; Herndon, Ash and Pollin, Camb J Econ 2014.")
fig.subplots_adjust(left=0.12, right=0.92)
labs = ["As published (2010)","After correction (2013)"]; v = [-0.1, 2.2]
ax.bar(labs, v, color=[CORAL, GREEN], width=0.5); ax.axhline(0, color=INK2, lw=1)
ax.text(0, -0.1-0.22, "\u22120.1% a year", ha="center", fontsize=14, fontweight="bold", color=INK)
ax.text(1, 2.2+0.08, "2.2% a year", ha="center", fontsize=14, fontweight="bold", color=INK)
ax.set_ylim(-0.6, 2.7); ax.set_yticks([0,1,2], ["0%","1%","2%"]); ax.grid(axis="y", color=GRID, lw=0.8); ax.set_axisbelow(True)
ax.set_ylabel("Average annual GDP growth"); ax.tick_params(axis="x", length=0, labelsize=12, labelcolor=INK)
save(fig, "fig6_reinhart_rogoff.png")
print("p", round(p,4), "crit", round(crit,4))
