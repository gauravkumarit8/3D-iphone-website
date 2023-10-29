import React from 'react'
import AnimatedLogo from '../assets/images/logo-animated.gif';

const Loder = () => {
  return (
    <div className='loader'>
        <img className='logo' src={AnimatedLogo} alt='apple-loader' />
    </div>
  )
}

export default Loder