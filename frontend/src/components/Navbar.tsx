'use client';

import React from 'react';
import { LedMarqueeNav, LedMarqueeNavProps } from './LedMarqueeNav';

export interface NavbarProps extends LedMarqueeNavProps {}

export const Navbar: React.FC<NavbarProps> = (props) => {
  return <LedMarqueeNav {...props} />;
};
