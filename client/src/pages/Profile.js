import React from 'react';
// this component, Redirect, will allow us to redirect the user to another route within the application
import { Redirect, useParams } from 'react-router-dom';

import ThoughtList from '../components/ThoughtList';
import FriendList from '../components/FriendList';
import { ADD_FRIEND } from '../utils/mutations';
import { useQuery, useMutation } from '@apollo/client';
import { QUERY_USER, QUERY_ME } from '../utils/queries';
import Auth from '../utils/auth';
import ThoughtForm from '../components/ThoughtForm';

const Profile = (props) => {
  const { username: userParam } = useParams();

  const { loading, data } = useQuery(userParam ? QUERY_USER : QUERY_ME, {
    variables: { username: userParam },
  });

  // when we run QUERY_ME, the response will return with our data in the me property; but if it runs QUERY_USER instead,
  // the response will return with our data in the user property
  const user = data?.me || data?.user || {};

  const [addFriend] = useMutation(ADD_FRIEND);
  // redirect to personal profile page if username is the logged-in user's
  if (Auth.loggedIn() && Auth.getProfile().data.username === userParam) {
    return <Redirect to='/profile' />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user?.username) {
    return (
      <h4>
        You need to be logged in to see this page. Use the navigation links
        above to sign up or log in!
      </h4>
    );
  }

  // declare a handleClick() function with the following code to utilize the addFriend() mutation function
  const handleClick = async () => {
    try {
      await addFriend({
        variables: { id: user._id },
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className='flex-row mb-3'>
        <h2 className='bg-dark text-secondary p-3 display-inline-block'>
          Viewing {userParam ? `${user.username}'s` : 'your'} profile.
        </h2>
        {userParam && (
          <button className='btn ml-auto' onClick={handleClick}>
            Add Friend
          </button>
        )}
      </div>

      <div className='flex-row justify-space-between mb-3'>
        <div className='col-12 mb-3 col-lg-8'>
          <ThoughtList
            thoughts={user.thoughts}
            title={`${user.username}'s thoughts...`}
          />
        </div>

        <div className='col-12 col-lg-3 mb-3'>
          <FriendList
            username={user.username}
            friendCount={user.friendCount}
            friends={user.friends}
          />
        </div>
      </div>
      <div className='mb-3'>{!userParam && <ThoughtForm />}</div>
    </div>
  );
};

export default Profile;
