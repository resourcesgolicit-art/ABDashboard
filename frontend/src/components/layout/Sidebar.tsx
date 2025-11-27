import {
  Home,
  BookOpen,
  ShoppingCart,
  CreditCard,
  User,
  LogOut,
  X,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'My Courses', path: '/dashboard/my-courses' },
  { icon: ShoppingCart, label: 'Explore Courses', path: '/dashboard/explore' },
  {
    icon: CreditCard,
    label: 'Webinar schedule & Zoom link',
    path: '/dashboard/payments',
  },
  { icon: User, label: 'Profile', path: '/dashboard/profile' },
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    onClose(); // Close sidebar after logout
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden'
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        // Updated BG to your requested orange
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-[#F6A32F] text-white shadow-xl transition-transform duration-300 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='flex h-16 items-center justify-between border-b border-white/20 px-6 md:hidden'>
          <div className='flex items-center gap-2'>
            {/* Kept the logo text white, adjusted BG for contrast */}
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#F6A32F] font-bold text-sm'>
              AB
            </div>
            <span className='text-lg font-semibold'>AB Institute</span>
          </div>
          {/* Button icon is white */}
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='text-white hover:bg-white/10'
          >
            <X className='h-5 w-5' />
          </Button>
        </div>

        <nav className='space-y-1 p-4'>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              // Text color is white/80 for contrast
              // Hover/Active BG is a slightly lighter shade of the orange, or a muted neutral
              className='flex items-center gap-3 rounded-lg px-4 py-3 text-white/90 transition-all hover:bg-[#E0942C] hover:text-white'
              // Active class uses the tertiary accent for clear identification
              activeClassName='bg-[#F67315] text-white font-medium hover:bg-[#F67315]'
              onClick={() => {
                if (window.innerWidth < 768) {
                  onClose();
                }
              }}
            >
              <item.icon className='h-5 w-5' />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className='pt-4'>
            <Button
              variant='ghost'
              // Text color is white/80 for contrast
              className='w-full justify-start gap-3 text-white/90 hover:bg-[#E0942C] hover:text-white'
              onClick={handleLogout}
            >
              <LogOut className='h-5 w-5' />
              <span>Logout</span>
            </Button>
          </div>
        </nav>

        {/* Footer */}
        <div className='absolute bottom-4 left-0 w-full px-4 text-center text-white/90 text-sm'>
          <div className='flex flex-col items-center justify-center gap-2'>
            <span className='text-xs'>
              © {new Date().getFullYear()} AB Institute of Market Research &
              Analysis. All Rights Reserved.
            </span>

            <span className='text-xs'>Powered by</span>

            <a
              href='https://golicit.in'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-2 hover:opacity-80 transition-opacity'
            >
              <img
                src='/company_logo.png'
                alt='Golicit Logo'
                className='w-5 h-5 rounded'
              />
              <span className='font-medium text-xs'>
                Golicit Services Pvt Ltd
              </span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
