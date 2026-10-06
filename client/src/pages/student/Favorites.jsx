import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as tutorService from '../../services/tutorService.js';
import TutorCard from '../../components/tutor/TutorCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { IconHeart, IconSearch } from '../../components/common/Icons.jsx';

/** Saved tutors, newest first. */
export default function Favorites() {
  const { user } = useAuth();
  const [, setVersion] = useState(0);

  const favourites = tutorService.listFavorites(user.id);

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Favourite tutors</h1>
          <p className="dashboard-header__subtitle">
            {favourites.length > 0
              ? `${favourites.length} tutor${favourites.length === 1 ? '' : 's'} saved for comparison.`
              : 'Save tutors while browsing so you can compare them side by side.'}
          </p>
        </div>
        <Link className="btn btn--primary" to="/student/tutors">
          <IconSearch size={15} /> Browse more tutors
        </Link>
      </div>

      {favourites.length === 0 ? (
        <EmptyState
          icon={<IconHeart size={24} />}
          title="No favourite tutors yet"
          text="Tap the heart on any tutor card or profile to save it here. Favourites persist in this browser between sessions."
          action={<Link className="btn btn--primary" to="/student/tutors">Find tutors</Link>}
        />
      ) : (
        <div className="grid grid--cards">
          {favourites.map((fav) => (
            <TutorCard
              key={fav.id}
              tutor={{ ...fav.tutor, user: fav.user, rating: fav.rating }}
              favorite
              match={tutorService.matchReasons(fav.tutor, user)}
              onFavoriteChange={() => setVersion((v) => v + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}