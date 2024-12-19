import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { MessageCirclePlus } from 'lucide-react';
import { useMediaQuery } from '@mui/material';
import { useChatList } from '@/hooks/useChatList';
import ChatIcon from '../ui/chat-icon';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
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
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
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
  justifyContent: 'flex-end',
}));
interface SideBarProps{
 open:boolean,
 setOpen:(side:boolean)=>void,

 createNewChat:(chat:string)=>void
}

export default function Sidebar({open,setOpen,createNewChat}:SideBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
//   const [open, setOpen] = React.useState(false);
   const navigator = useNavigate();
  const handleDrawerOpen = () => {
    setOpen(true);
  
  };

  // const handleDrawerClose = (e) => {
  //   e.preventDefault(); // Prevent default link behavior
  //   e.stopPropagation(); 
  //   setOpen(false);
  //   setRecent(false)
  // };
  const handleNewChat = (e) =>{
    e.preventDefault(); // Prevent default link behavior
    e.stopPropagation(); 
    createNewChat()
    setOpen(false)
  
    navigator('/');
  }
 
  
  const {data}=useChatList();
  return (
    <Box sx={{ display: 'flex'}}>
      <CssBaseline />
  
      <Drawer
        sx={{
          width:isMobile ? "100%":drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width:isMobile ? "100%":drawerWidth,
            boxSizing: 'border-box',
            marginTop:"70px",
            backgroundColor: "#F6F8FA"
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <List>
        <div className='flex cursor-pointer px-4' onClick={handleNewChat}>
            <div>
            <MessageCirclePlus
            className="w-6 h-6 text-indigo-600"
           
          />
            </div>
            <div className='ml-2'>
  <p className='text-lg'>Start new chat</p>
</div>

        
        </div>
        </List>
        <List>
          <p className='flex text-base font-bold ml-4'>Recents</p>
  {data.map((datas, index) => (
    <ListItem key={index} className="flex items-center">
      {/* Icon and Text Section */}
      <div className='flex'   onClick={() => {
    // e.preventDefault(); // Prevent default link behavior
    // e.stopPropagation(); // Stop bubbling
    navigator(`/chat/${datas.chat_id}`);
    setOpen(false);
   
  }}>
      <div className='flex mt-2'>
      <ListItemIcon className="min-w-[30px] mr-2"> {/* Closer spacing */}
        <ChatIcon />
      </ListItemIcon>
      </div>
      <div className='flex -ml-8'>
      <ListItemText
        primary={
          <p className="text-sm text-gray-700 truncate w-[200px]">
            {datas.last_message}
          </p>
        }
      />
      </div>
      </div>
  
    
    </ListItem>
  ))}
</List>

      </Drawer>
  
    </Box>
  );
}
