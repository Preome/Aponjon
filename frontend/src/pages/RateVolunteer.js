import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RateVolunteer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/help/my-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const requests = await response.json();
      const found = requests.find(r => r._id === id);
      setRequest(found);
    } catch (error) {
      console.error('Failed to fetch request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/help/rate/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, review })
      });

      if (response.ok) {
        alert('✅ Thank you for your feedback!');
        navigate('/my-requests');
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 text-center">
        <h2 className="text-2xl text-gray-600">Request not found</h2>
      </div>
    );
  }

  if (request.status !== 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 text-center">
        <h2 className="text-2xl text-red-600">Cannot rate incomplete request</h2>
        <p className="mt-4">This request must be completed before rating.</p>
      </div>
    );
  }

  if (request.rating) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 text-center">
        <h2 className="text-2xl text-green-600">Already Rated ✓</h2>
        <p className="mt-4">You've already rated this volunteer.</p>
        <p className="mt-2">Your rating: {request.rating} ⭐</p>
        {request.review && <p className="mt-2 italic">"{request.review}"</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-primary-600 py-6 px-8">
            <h2 className="text-3xl font-bold text-white text-center">Rate Your Volunteer</h2>
            <p className="text-primary-100 text-center mt-2">
              How was your experience with {request.volunteer?.name}?
            </p>
          </div>

          <div className="py-8 px-8">
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Task: {request.taskType?.replace('-', ' ')}</p>
              <p className="text-sm text-gray-600 mt-1">{request.description}</p>
            </div>

            {/* Star Rating */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Rating
              </label>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="text-3xl focus:outline-none transition-transform hover:scale-110"
                  >
                    <span className={
                      star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                    }>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                {rating > 0 ? `You selected ${rating} star${rating > 1 ? 's' : ''}` : 'Click to rate'}
              </p>
            </div>

            {/* Review Text */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Write a Review (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows="4"
                className="input-field"
                placeholder="Share your experience... How did the volunteer help you?"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateVolunteer;