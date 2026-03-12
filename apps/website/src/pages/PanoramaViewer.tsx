import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Panorama from '../components/Panorama';
import { getPublishedTour, type Project } from '../script/storage';

export const PanoramaViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getPublishedTour(id).then((data) => {
      setProject(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000', color: '#fff' }}>
        Loading tour...
      </div>
    );
  }

  if (!project || !project.tour.startNode) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000', color: '#fff' }}>
        Tour not found.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => navigate(`/tour/${id}`)}
        className='exitTourButton'
      >
        Exit Tour
      </button>
      <Panorama GivenPanoNode={project.tour.startNode} />
    </div>
  );
};
