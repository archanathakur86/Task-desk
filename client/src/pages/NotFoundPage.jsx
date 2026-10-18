import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';

export default function NotFoundPage() {
  return (
    <EmptyState
      title="This page does not exist"
      message="The link may be old, or the record was removed."
      action={<Link to="/" className="btn btn-primary">Back to dashboard</Link>}
    />
  );
}
