// csv.js - CSV export helper

const CSVExporter = {
  /**
   * Generates and downloads a CSV file for the quiz result.
   * @param {Object} result - The result object
   * @param {Array} reviewData - Array of {question, yourAnswer, correctAnswer, isCorrect}
   */
  download(result, reviewData) {
    const rows = [];

    rows.push(['Math MCQ Practice - Result Report']);
    rows.push([]);
    rows.push(['Name', result.name]);
    rows.push(['Age', result.age]);
    rows.push(['Date', result.date]);
    rows.push(['Score', `${result.score} / ${result.total}`]);
    rows.push(['Correct Answers', result.correct]);
    rows.push(['Wrong Answers', result.wrong]);
    rows.push(['Percentage', `${result.percentage}%`]);
    rows.push([]);
    rows.push(['#', 'Question', 'Your Answer', 'Correct Answer', 'Result']);

    reviewData.forEach((item, idx) => {
      rows.push([
        idx + 1,
        item.question,
        item.yourAnswer || 'Not Answered',
        item.correctAnswer,
        item.isCorrect ? 'Correct' : 'Incorrect'
      ]);
    });

    const csvContent = rows.map(row =>
      row.map(cell => {
        const str = String(cell ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      }).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = (result.name || 'student').replace(/[^a-z0-9]/gi, '_');
    link.download = `MathMCQ_Result_${safeName}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
