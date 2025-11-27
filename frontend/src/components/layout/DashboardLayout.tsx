import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // -----------------------------
    // 🚫 Disable Right Click
    // -----------------------------
    const disableRightClick = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', disableRightClick);

    // -----------------------------
    // 🚫 Disable Print (Ctrl+P)
    // -----------------------------
    const disablePrint = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        alert('Printing is disabled on this page.');
      }
    };
    document.addEventListener('keydown', disablePrint);

    // -----------------------------
    // 🚫 Disable Inspect Element
    // F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S
    // -----------------------------
    const disableInspect = (e: KeyboardEvent) => {
      if (e.key === 'F12') e.preventDefault();

      if (
        e.ctrlKey &&
        e.shiftKey &&
        ['I', 'J', 'C'].includes(e.key.toUpperCase())
      ) {
        e.preventDefault();
      }

      if (e.ctrlKey && ['U', 'S'].includes(e.key.toUpperCase())) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', disableInspect);

    // -----------------------------
    // 🚫 Disable Print Screen (PrtSc)
    // -----------------------------
    const disablePrintScreen = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText(''); // clears capture
        document.body.style.opacity = '0';
        setTimeout(() => {
          document.body.style.opacity = '1';
        }, 200);
      }
    };
    document.addEventListener('keydown', disablePrintScreen);

    // -----------------------------
    // 🚫 Disable Copy / Select Text
    // -----------------------------
    const disableCopy = (e: ClipboardEvent) => e.preventDefault();
    const disableSelect = (e: Event) => e.preventDefault();

    document.addEventListener('copy', disableCopy);
    document.addEventListener('cut', disableCopy);
    document.addEventListener('selectstart', disableSelect);

    // -----------------------------
    // OPTIONAL: Auto-block DevTools open (commented)
    // -----------------------------
    // const checkDevTools = setInterval(() => {
    //   const threshold = 170;
    //   if (
    //     window.outerHeight - window.innerHeight > threshold ||
    //     window.outerWidth - window.innerWidth > threshold
    //   ) {
    //     document.body.innerHTML = "<h1 style='text-align:center;margin-top:50px'>DevTools is disabled.</h1>";
    //   }
    // }, 1000);

    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disablePrint);
      document.removeEventListener('keydown', disableInspect);
      document.removeEventListener('keydown', disablePrintScreen);
      document.removeEventListener('copy', disableCopy);
      document.removeEventListener('cut', disableCopy);
      document.removeEventListener('selectstart', disableSelect);
      // clearInterval(checkDevTools);
    };
  }, []);

  return (
    <div className='min-h-screen flex flex-col'>
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className='flex w-full'>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* MAIN CONTENT AREA - FIXED */}
        <main
          className='
            flex-1 
            p-4 md:p-6 lg:p-8
            overflow-y-auto
            bg-gradient-to-br 
            from-[#0b1f3a] 
            to-[#090e1d] 
            text-white
            min-h-screen
          '
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
