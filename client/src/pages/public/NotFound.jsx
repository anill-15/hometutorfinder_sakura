import { Link } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState.jsx';
import { IconSearch } from '../../components/common/Icons.jsx';

export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState
        icon={<IconSearch size={24} />}
        title="We could not find that page"
        text="The link may be outdated or mistyped. Try searching for a tutor, or head back to the home page."
        action={
          <div className="btn-group">
            <Link className="btn btn--primary" to="/">Back to home</Link>
            <Link className="btn btn--secondary" to="/tutors">Find tutors</Link>
          </div>
        }
      />
    </div>
  );
}