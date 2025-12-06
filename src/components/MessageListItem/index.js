import React, { useState, useContext } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Stack,
  useTheme,
  Link,
  CircularProgress
} from '@mui/material';
import {
  AccessTime,
  Block,
  Done,
  DoneAll,
  ExpandMore,
  GetApp,
  Reply,
} from '@mui/icons-material';
import { green } from '@mui/material/colors';

import MarkdownWrapper from '../MarkdownWrapper';
import ModalImageCors from '../ModalImageCors';
import AudioModal from '../AudioModal';
import VCardPreview from '../VCardPreview';
import LocationPreview from '../LocationPreview';
import MessageOptionsMenu from '../MessageOptionsMenu';
import { ReplyMessageContext } from '../../context/ReplyingMessage/ReplyingMessageContext';
import { AuthContext } from '../../context/Auth/AuthContext';
import SelectMessageCheckbox from '../MessagesList/SelectMessageCheckbox'; // Ajuste o caminho se necessário
import { ForwardMessageContext } from '../../context/ForwarMessage/ForwardMessageContext';


const MessageAck = ({ ack }) => {
  if (ack === 0) {
    return <AccessTime fontSize="small" sx={{ color: 'text.secondary' }} />;
  }
  if (ack === 1) {
    return <Done fontSize="small" sx={{ color: 'text.secondary' }} />;
  }
  if (ack === 2) {
    return <DoneAll fontSize="small" sx={{ color: 'text.secondary' }} />;
  }
  if (ack === 3 || ack === 4 || ack === 5) {
    return <DoneAll fontSize="small" sx={{ color: green[500] }} />;
  }
  return null;
};

const QuotedMessage = ({ quotedMsg }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        background: theme.palette.mode === 'light' ? '#f0f0f0' : '#333333',
        borderLeft: `4px solid ${quotedMsg.fromMe ? theme.palette.primary.main : theme.palette.secondary.main}`,
        p: 1,
        my: 1,
        borderRadius: 1,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 'bold', color: quotedMsg.fromMe ? theme.palette.primary.main : theme.palette.secondary.main }}>
        {quotedMsg.contact?.name || (quotedMsg.fromMe && "Você")}
      </Typography>
      <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {quotedMsg.body}
      </Typography>
    </Box>
  );
}

const MediaMessage = ({ message }) => {
  if (message.mediaType === "locationMessage" && message.body.split('|').length >= 2) {
    const [imageLocation, linkLocation, descriptionLocation] = message.body.split('|');
    return <LocationPreview image={imageLocation} link={linkLocation} description={descriptionLocation} />
  }
  if (message.mediaType === "contactMessage") {
    const [contact, ...numbers] = message.body.split("\n").map(v => v.split(":")[1]);
    return <VCardPreview contact={contact} numbers={numbers.join(", ")} />
  }
  if (message.mediaType === "image") {
    return <ModalImageCors imageUrl={message.mediaUrl} />;
  }
  if (message.mediaType === "audio") {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <AudioModal url={message.mediaUrl} />
      </Box>
    );
  }
  if (message.mediaType === "video") {
    return (
      <video
        src={message.mediaUrl}
        controls
        style={{ width: '100%', maxWidth: '250px', borderRadius: '8px' }}
      />
    );
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button
        startIcon={<GetApp />}
        variant="outlined"
        color="primary"
        href={message.mediaUrl}
        target="_blank"
      >
        Download
      </Button>
    </Box>
  );
};


const MessageListItem = ({ message, isGroup }) => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const { setReplyingMessage } = useContext(ReplyMessageContext);
  const { showSelectMessageCheckbox } = useContext(ForwardMessageContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const messageOptionsMenuOpen = Boolean(anchorEl);

  const isMe = message.fromMe;

  const handleOpenMessageOptionsMenu = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMessageOptionsMenu = () => {
    setAnchorEl(null);
  };

  const handleReply = () => {
    setReplyingMessage(message);
  };

  const bubbleStyles = {
    p: 1.5,
    borderRadius: isMe ? '10px 10px 0 10px' : '10px 10px 10px 0',
    bgcolor: isMe ? 'primary.main' : 'background.paper',
    color: isMe ? 'primary.contrastText' : 'text.primary',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    maxWidth: 'calc(100% - 40px)',
    wordBreak: 'break-word',
    position: 'relative',
    '&:hover .message-actions': {
      opacity: 1,
    }
  };

  const renderMessageContent = () => {
    if (message.isDeleted) {
      return (
        <Typography variant="body2" sx={{ fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Block fontSize="small" /> Mensagem apagada
        </Typography>
      );
    }

    return (
      <>
        {message.quotedMsg && <QuotedMessage quotedMsg={message.quotedMsg} />}
        
        {message.mediaUrl && <MediaMessage message={message} />}
        
        <Typography component="div" variant="body1">
          <MarkdownWrapper>{message.body}</MarkdownWrapper>
        </Typography>
      </>
    );
  };

  return (
    <Box
      id={`message-${message.id}`}
      sx={{
        display: 'flex',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
        mb: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
        {showSelectMessageCheckbox && <SelectMessageCheckbox message={message} />}
        <Paper sx={bubbleStyles}>
          <Stack spacing={0.5}>
            {isGroup && !isMe && (
              <Typography variant="caption" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold' }}>
                {message.contact?.name}
              </Typography>
            )}

            {renderMessageContent()}

            <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: isMe ? 'primary.contrastText' : 'text.secondary', opacity: 0.7 }}>
                {message.isEdited && 'Editada'} {format(parseISO(message.createdAt), 'HH:mm')}
              </Typography>
              {isMe && <MessageAck ack={message.ack} />}
            </Stack>
          </Stack>
          <IconButton
            className="message-actions"
            size="small"
            onClick={handleOpenMessageOptionsMenu}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              opacity: 0,
              transition: 'opacity 0.2s',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <ExpandMore fontSize="inherit" sx={{ color: isMe ? 'primary.contrastText' : 'text.primary' }} />
          </IconButton>
        </Paper>
      </Box>

      <MessageOptionsMenu
        message={message}
        anchorEl={anchorEl}
        menuOpen={messageOptionsMenuOpen}
        handleClose={handleCloseMessageOptionsMenu}
        onReply={handleReply}
      />
    </Box>
  );
};

export default MessageListItem;
