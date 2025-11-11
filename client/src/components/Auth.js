// client/src/components/Auth.js
import React from 'react';

function Auth({ user }) {
  if (user) {
    // If the user object exists, they are logged in
    return (
      <div>
        <span>Welcome, {user.display_name}!</span>
        {/* CHANGE HERE: Full URL for logout */}
        <a href="http://localhost:5000/auth/logout" style={{ marginLeft: '10px' }}>Logout</a>
      </div>
    );
  } else {
    // If user is null, they are logged out
    return (
      <div>
        <span>Please log in.</span>
        {/* CHANGE HERE: Full URL for login */}
        <a href="http://localhost:5000/auth/google" style={{ marginLeft: '10px' }}>Login with Google</a>
      </div>
    );
  }
}

export default Auth;