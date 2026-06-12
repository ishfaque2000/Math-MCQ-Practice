// reportcard.js — Generates and downloads a beautiful math report card as HTML

const ReportCard = {
  download(result, reviewData) {
    const gradeColors = {
      'A+': '#34d399', 'A': '#34d399',
      'B':  '#a855f7',
      'C':  '#fbbf24',
      'D':  '#22d3ee',
      'F':  '#f87171'
    };
    const gradeColor = gradeColors[result.grade] || '#a855f7';

    const correctItems = reviewData.filter(r => r.isCorrect);
    const wrongItems   = reviewData.filter(r => !r.isCorrect);

    // Topic breakdown
    const topicMap = {};
    reviewData.forEach(r => {
      if (!topicMap[r.topic]) topicMap[r.topic] = { total: 0, correct: 0 };
      topicMap[r.topic].total++;
      if (r.isCorrect) topicMap[r.topic].correct++;
    });

    const topicRows = Object.entries(topicMap).map(([topic, d]) => {
      const pct = Math.round((d.correct / d.total) * 100);
      const bar = `
        <div style="flex:1; background:rgba(255,255,255,0.08); border-radius:4px; height:8px; overflow:hidden;">
          <div style="width:${pct}%; height:100%; background:${gradeColor}; border-radius:4px; transition:width 1s;"></div>
        </div>`;
      return `<tr>
        <td style="padding:8px 10px; color:#a5b4fc; font-weight:600;">${topic}</td>
        <td style="padding:8px 10px; color:#f0f4ff; font-family:monospace;">${d.correct}/${d.total}</td>
        <td style="padding:8px 10px; width:40%;">${bar}</td>
        <td style="padding:8px 10px; color:${gradeColor}; font-weight:700;">${pct}%</td>
      </tr>`;
    }).join('');

    const wrongListHtml = wrongItems.slice(0, 10).map((r, i) => `
      <div style="background:rgba(248,113,113,0.07); border:1px solid rgba(248,113,113,0.2); border-radius:10px; padding:14px; margin-bottom:10px;">
        <div style="font-weight:700; color:#f0f4ff; margin-bottom:6px; font-size:0.93rem;">${i + 1}. ${escapeH(r.question)}</div>
        <div style="font-size:0.85rem; color:#f87171;">✗ Your answer: ${escapeH(r.yourAnswer || 'Not answered')}</div>
        <div style="font-size:0.85rem; color:#34d399; margin-top:3px;">✓ Correct: ${escapeH(r.correctAnswer)}</div>
      </div>`).join('');

    const starsHtml = Array.from({ length: 80 }, () => {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const s = (Math.random() * 2 + 0.5).toFixed(1);
      const o = (Math.random() * 0.7 + 0.3).toFixed(2);
      return `<circle cx="${x}%" cy="${y}%" r="${s}" fill="white" opacity="${o}"/>`;
    }).join('');

    function escapeH(str) {
      if (str == null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Math Report Card — ${escapeH(result.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Space Grotesk', sans-serif;
    background: #05060f;
    color: #f0f4ff;
    min-height: 100vh;
    padding: 0;
  }
  @media print {
    body { background: #05060f !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    .page-break { page-break-before: always; }
  }
</style>
</head>
<body>

<!-- PRINT BUTTON -->
<div class="no-print" style="position:fixed; top:20px; right:20px; z-index:999; display:flex; gap:10px;">
  <button onclick="window.print()" style="background:linear-gradient(135deg,#7c3aed,#a855f7); color:#fff; border:none; padding:12px 24px; border-radius:10px; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:0.95rem; cursor:pointer; box-shadow:0 4px 20px rgba(124,58,237,0.5);">🖨️ Print / Save PDF</button>
</div>

<!-- PAGE 1: COVER -->
<div style="min-height:100vh; background:linear-gradient(160deg, #0d0e2b 0%, #05060f 60%, #13143a 100%); position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px;">

  <!-- Stars SVG -->
  <svg style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none;" xmlns="http://www.w3.org/2000/svg">
    ${starsHtml}
  </svg>

  <!-- Nebula glows -->
  <div style="position:absolute; top:-10%; left:-10%; width:60%; height:60%; background:radial-gradient(ellipse, rgba(124,58,237,0.2), transparent 70%); pointer-events:none;"></div>
  <div style="position:absolute; bottom:-10%; right:-10%; width:50%; height:50%; background:radial-gradient(ellipse, rgba(34,211,238,0.12), transparent 70%); pointer-events:none;"></div>

  <!-- Header bar -->
  <div style="position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg, #7c3aed, #22d3ee, #a855f7);"></div>

  <!-- Content -->
  <div style="position:relative; z-index:1; text-align:center; max-width:700px; width:100%;">

    <!-- Logo area -->
    <div style="margin-bottom:20px;">
      <div style="font-family:'Orbitron',monospace; font-size:0.8rem; letter-spacing:0.2em; color:#6b7db3; text-transform:uppercase; margin-bottom:8px;">Official Assessment</div>
      <div style="font-family:'Orbitron',monospace; font-size:2rem; font-weight:900; background:linear-gradient(135deg, #c084fc, #22d3ee); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1.2; margin-bottom:4px;">📐 Math MCQ</div>
      <div style="font-family:'Orbitron',monospace; font-size:1rem; color:#6b7db3; letter-spacing:0.12em;">PRACTICE REPORT CARD</div>
    </div>

    <!-- Decorative line -->
    <div style="width:200px; height:1px; background:linear-gradient(90deg, transparent, #7c3aed, transparent); margin:20px auto;"></div>

    <!-- Grade Circle -->
    <div style="margin:24px auto;">
      <div style="width:160px; height:160px; border-radius:50%; border:3px solid ${gradeColor}; margin:0 auto; display:flex; flex-direction:column; align-items:center; justify-content:center; background:radial-gradient(circle, rgba(${gradeColor === '#34d399' ? '52,211,153' : gradeColor === '#a855f7' ? '168,85,247' : gradeColor === '#fbbf24' ? '251,191,36' : gradeColor === '#22d3ee' ? '34,211,238' : '248,113,113'},0.15), transparent); box-shadow:0 0 50px ${gradeColor}55, 0 0 100px ${gradeColor}22;">
        <div style="font-family:'Orbitron',monospace; font-size:4rem; font-weight:900; color:${gradeColor}; line-height:1;">${escapeH(result.grade)}</div>
        <div style="font-size:0.8rem; color:#6b7db3; letter-spacing:0.1em; text-transform:uppercase; margin-top:4px;">Grade</div>
      </div>
    </div>

    <!-- Score big display -->
    <div style="font-family:'Orbitron',monospace; font-size:3.5rem; font-weight:900; color:#f0f4ff; letter-spacing:0.05em; line-height:1;">${result.score}<span style="font-size:2rem; color:#6b7db3;">/${result.total}</span></div>
    <div style="font-size:1.1rem; color:#a5b4fc; margin-top:4px;">${result.percentage}% Accuracy</div>

    <!-- Student info -->
    <div style="margin:28px auto; background:rgba(13,14,43,0.8); border:1px solid rgba(42,45,110,0.7); border-radius:16px; padding:24px 32px; max-width:420px; backdrop-filter:blur(10px);">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; text-align:left;">
        <div>
          <div style="font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:#6b7db3; margin-bottom:4px;">Student</div>
          <div style="font-weight:700; color:#f0f4ff; font-size:1.05rem;">${escapeH(result.name)}</div>
        </div>
        <div>
          <div style="font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:#6b7db3; margin-bottom:4px;">Age</div>
          <div style="font-weight:700; color:#f0f4ff; font-size:1.05rem;">${escapeH(String(result.age))}</div>
        </div>
        <div>
          <div style="font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:#6b7db3; margin-bottom:4px;">Correct</div>
          <div style="font-weight:700; color:#34d399; font-size:1.05rem;">✓ ${result.correct}</div>
        </div>
        <div>
          <div style="font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:#6b7db3; margin-bottom:4px;">Incorrect</div>
          <div style="font-weight:700; color:#f87171; font-size:1.05rem;">✗ ${result.wrong}</div>
        </div>
      </div>
      <div style="border-top:1px solid rgba(42,45,110,0.5); margin-top:16px; padding-top:12px; font-size:0.82rem; color:#6b7db3; text-align:center;">${escapeH(result.date)}</div>
    </div>

    <!-- Message -->
    <div style="font-size:1.15rem; font-weight:600; color:#c084fc; margin-top:8px;">${escapeH(result.message)}</div>

    <!-- Performance bar -->
    <div style="margin:28px auto; max-width:420px;">
      <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#6b7db3; margin-bottom:8px;">
        <span>Performance</span><span>${result.percentage}%</span>
      </div>
      <div style="background:rgba(42,45,110,0.5); border-radius:999px; height:14px; overflow:hidden;">
        <div style="width:${result.percentage}%; height:100%; background:linear-gradient(90deg, #7c3aed, #22d3ee); border-radius:999px; box-shadow:0 0 12px rgba(34,211,238,0.4);"></div>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:rgba(107,125,179,0.6); margin-top:6px;">
        <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
      </div>
    </div>

    <!-- Math decorative symbols -->
    <div style="display:flex; justify-content:center; gap:24px; margin-top:20px; font-size:1.5rem; opacity:0.2;">
      <span>∑</span><span>∫</span><span>π</span><span>√</span><span>∞</span><span>Δ</span><span>θ</span>
    </div>
  </div>

  <!-- Footer -->
  <div style="position:absolute; bottom:20px; left:0; right:0; text-align:center; font-size:0.72rem; color:rgba(107,125,179,0.5); letter-spacing:0.08em;">MATH MCQ PRACTICE · CONFIDENTIAL ACADEMIC RECORD</div>
</div>

<!-- PAGE 2: TOPIC BREAKDOWN + MISSED QUESTIONS -->
<div class="page-break" style="min-height:100vh; background:#0d0e2b; padding:50px 40px; position:relative; overflow:hidden;">

  <!-- Top accent -->
  <div style="position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, #7c3aed, #22d3ee, #a855f7);"></div>
  <div style="position:absolute; top:-100px; right:-100px; width:300px; height:300px; background:radial-gradient(circle, rgba(124,58,237,0.12), transparent); pointer-events:none;"></div>

  <div style="max-width:700px; margin:0 auto;">

    <!-- Section: Topic Breakdown -->
    <div style="margin-bottom:40px;">
      <div style="font-family:'Orbitron',monospace; font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; color:#7c3aed; margin-bottom:6px;">Performance Analysis</div>
      <h2 style="font-family:'Orbitron',monospace; font-size:1.3rem; font-weight:700; color:#f0f4ff; margin-bottom:20px;">Topic Breakdown</h2>

      <div style="background:rgba(5,6,15,0.6); border:1px solid rgba(42,45,110,0.7); border-radius:14px; overflow:hidden;">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:rgba(42,45,110,0.4);">
              <th style="padding:12px 10px; text-align:left; font-size:0.72rem; letter-spacing:0.08em; text-transform:uppercase; color:#6b7db3; font-weight:700;">Topic</th>
              <th style="padding:12px 10px; text-align:left; font-size:0.72rem; letter-spacing:0.08em; text-transform:uppercase; color:#6b7db3; font-weight:700;">Score</th>
              <th style="padding:12px 10px; text-align:left; font-size:0.72rem; letter-spacing:0.08em; text-transform:uppercase; color:#6b7db3; font-weight:700;">Progress</th>
              <th style="padding:12px 10px; text-align:left; font-size:0.72rem; letter-spacing:0.08em; text-transform:uppercase; color:#6b7db3; font-weight:700;">%</th>
            </tr>
          </thead>
          <tbody>
            ${topicRows}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Section: Questions to Review -->
    ${wrongItems.length > 0 ? `
    <div>
      <div style="font-family:'Orbitron',monospace; font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; color:#f87171; margin-bottom:6px;">Review Section</div>
      <h2 style="font-family:'Orbitron',monospace; font-size:1.3rem; font-weight:700; color:#f0f4ff; margin-bottom:16px;">Questions to Revisit (${Math.min(wrongItems.length, 10)} of ${wrongItems.length})</h2>
      ${wrongListHtml}
    </div>` : `
    <div style="text-align:center; padding:32px; background:rgba(52,211,153,0.07); border:1px solid rgba(52,211,153,0.2); border-radius:14px;">
      <div style="font-size:2rem; margin-bottom:8px;">🎉</div>
      <div style="font-family:'Orbitron',monospace; font-size:1rem; color:#34d399; font-weight:700;">All Correct!</div>
      <div style="color:#6b7db3; font-size:0.9rem; margin-top:6px;">Flawless performance — nothing to review.</div>
    </div>`}

    <!-- Footer watermark -->
    <div style="margin-top:40px; text-align:center; border-top:1px solid rgba(42,45,110,0.3); padding-top:20px;">
      <div style="font-family:'Orbitron',monospace; font-size:0.75rem; letter-spacing:0.1em; color:rgba(107,125,179,0.4);">📐 MATH MCQ PRACTICE · ${escapeH(result.date)}</div>
      <div style="display:flex; justify-content:center; gap:16px; margin-top:12px; font-size:1.2rem; opacity:0.15;">
        <span>π</span><span>∑</span><span>∫</span><span>√</span><span>∞</span>
      </div>
    </div>

  </div>
</div>

</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    const safe = (result.name || 'student').replace(/[^a-z0-9]/gi, '_');
    a.download = `MathReportCard_${safe}_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
