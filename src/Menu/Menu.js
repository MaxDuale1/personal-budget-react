import React from 'react';

import {Link

} from 'react-router-dom';

function Menu() {
  return (
    <nav aria-label="Primary">
    <ul>
        <li><Link to="/" aria-current="page">Home</Link></li>
        <li><Link to="/about.html">About</Link></li>
        <li><Link to="/login.html">Login</Link></li>
        <li><Link to="https://google.com" rel="noopener" target="_blank" aria-label="Open Google in Link new tab">Google</Link></li>
    </ul>
</nav>
  );
}

export default Menu;
