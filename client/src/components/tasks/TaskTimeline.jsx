import { formatDate } from '../../lib/format';

const STEPS = ['Todo', 'In Progress', 'Completed'];

export default function TaskTimeline({ status, startDate, dueDate, completedDate }) {
  if (status === 'Cancelled') {
    return <p className="timeline-note">This task was cancelled and will not be worked on.</p>;
  }

  const currentIndex = STEPS.indexOf(status);
  const captions = {
    Todo: `Starts ${formatDate(startDate)}`,
    'In Progress': `Due ${formatDate(dueDate)}`,
    Completed: completedDate ? `Finished ${formatDate(completedDate)}` : `Due ${formatDate(dueDate)}`,
  };

  return (
    <ol className="timeline">
      {STEPS.map((step, index) => (
        <li key={step} className={index <= currentIndex ? 'timeline-done' : ''}>
          <strong>{step}</strong>
          <span className="muted small-text">{captions[step]}</span>
        </li>
      ))}
    </ol>
  );
}
