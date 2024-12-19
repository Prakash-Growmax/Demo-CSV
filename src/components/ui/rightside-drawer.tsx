import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

import CssBaseline from '@mui/material/CssBaseline';
import CloseIcon from '@mui/icons-material/Close';
import { Card, CardMedia, useMediaQuery } from '@mui/material';
import textImg from "../../Assets/new.png";


const drawerWidth = 400;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: -drawerWidth,
  /**
   * This is necessary to enable the selection of content. In the DOM, the stacking order is determined
   * by the order of appearance. Following this rule, elements appearing later in the markup will overlay
   * those that appear earlier. Since the Drawer comes after the Main content, this adjustment ensures
   * proper interaction with the underlying content.
   */
  position: 'relative',
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: 0,
      },
    },
  ],
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: drawerWidth,
      },
    },
  ],
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

export default function RightSideBar({openRight,setOpenRight}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))


  const handleDrawerClose = () => {
    setOpenRight(false)
  };

  return (
    <Box sx={{ display: 'flex'}}>
      <CssBaseline />
  
        
      <Drawer
  sx={{
    width: isMobile ? "100%" : drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: isMobile ? "100%" : drawerWidth,
      top: isMobile ? 0 : '90px', // Adjust top for mobile
      right: isMobile ? 0 : '20px', // Adjust right for mobile
      height: isMobile ? "100%" : "670px", // Adjust height for mobile
      backgroundColor: "#F6F8FA",
      borderRadius: isMobile ? 0 : "16px", // No rounded corners on mobile
      boxShadow: isMobile ? "none" : "0px 4px 10px rgba(0, 0, 0, 0.1)", // No shadow on mobile
    },
  }}
  variant="persistent"
  anchor="right"
  open={openRight}
>
<div className='flex flex-col'>
<div className='flex mt-4 justify-between px-8'>
<div>
<span className="text-lg font-semibold">Chat controls</span>
</div>

<div>
  <CloseIcon onClick={handleDrawerClose}/>
</div>
</div>
<div className='flex px-8 mt-4'>
<span className="text-sm font-semibold text-gray-500">content</span>
</div>
<div className='flex px-8 mt-4'>
<Card sx={{ display: 'flex', width:"387px",height:"60px"}}>
  
<CardMedia
        component="img"
        sx={{ width:70,padding:"10px" }}
        image={textImg}
        alt="Live from space album cover"
      />
  <span className="breakwords text-sm font-semibold ml-4 mt-4">Screenshoot.png</span>
  </Card>

</div>
</div>


     
   
     
      </Drawer>
    </Box>
  );
}
