import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import { green, blue, red } from "@material-ui/core/colors";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import Chip from "@material-ui/core/Chip";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  ticket: {
    position: "relative",
    padding: theme.spacing(1.5),
    borderRadius: "16px",
    backdropFilter: "blur(20px)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    "&:hover": {
      boxShadow: "0 16px 64px rgba(0, 0, 0, 0.15)",
      transform: "translateY(-4px)",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
  },

  pendingTicket: {
    cursor: "unset",
  },

  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  noTicketsText: {
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0px",
  },

  contactNameWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(0.5),
  },

  lastMessageTime: {
    justifySelf: "flex-end",
    fontSize: "12px",
    color: "rgb(104, 121, 146)",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(10px)",
    padding: "4px 8px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },

  closedBadge: {
    alignSelf: "center",
    justifySelf: "flex-end",
    marginRight: 32,
    marginLeft: "auto",
  },

  contactLastMessage: {
    paddingRight: 20,
  },

  newMessagesCount: {
    alignSelf: "center",
    marginRight: 8,
    marginLeft: "auto",
  },

  badgeStyle: {
    color: "white",
    backgroundColor: "rgba(33, 150, 243, 0.9)",
    fontWeight: "bold",
    fontSize: "11px",
    borderRadius: "10px",
    padding: "2px 6px",
    boxShadow: "0 2px 8px rgba(33, 150, 243, 0.4)",
  },

  acceptButton: {
    position: "absolute",
    left: "50%",
  },

  ticketQueueColor: {
    flex: "none",
    width: "8px",
    height: "100%",
    position: "absolute",
    top: "0%",
    left: "0%",
    borderTopLeftRadius: "16px",
    borderBottomLeftRadius: "16px",
  },

  avatar: {
    width: 48,
    height: 48,
    marginRight: theme.spacing(2),
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },

  contactName: {
    fontWeight: 600,
    fontSize: "15px",
    color: "rgb(27, 40, 56)",
  },

  lastMessage: {
    fontSize: "14px",
    color: "rgb(104, 121, 146)",
    lineHeight: 1.4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },

  ticketInfo: {
    flex: 1,
    minWidth: 0,
  },

  statusChip: {
    fontSize: "11px",
    fontWeight: 600,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },

  unreadBadge: {
    backgroundColor: "rgba(33, 150, 243, 0.9)",
    color: "white",
    fontWeight: "bold",
    fontSize: "11px",
    borderRadius: "10px",
    padding: "2px 6px",
    boxShadow: "0 2px 8px rgba(33, 150, 243, 0.4)",
    zIndex: 1000,
  },

  closedChip: {
    backgroundColor: "rgba(244, 67, 54, 0.9)",
    color: "white",
    fontWeight: 600,
    borderRadius: "10px",
    padding: "2px 6px",
    boxShadow: "0 2px 8px rgba(244, 67, 54, 0.4)",
  },
}));

const TicketListItem = ({ ticket }) => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleAcepptTicket = async (ticket) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: "open",
        userId: user?.id,
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/${ticket.uuid}`);
  };

  const handleSelectTicket = (ticket) => {
    history.push(`/tickets/${ticket.uuid}`);
  };

  const renderLastMessage = () => {
    if (!ticket.lastMessage) return "Nenhuma mensagem";
    
    if (ticket.lastMessage.includes("VCARD")) {
      return "Novo contato recebido...";
    }
    
    return ticket.lastMessage;
  };

  return (
    <React.Fragment key={ticket.id}>
      <ListItem
        dense
        button
        onClick={(e) => {
          if (ticket.status === "pending") return;
          handleSelectTicket(ticket);
        }}
        selected={ticketId && +ticketId === ticket.id}
        className={clsx(classes.ticket, {
          [classes.pendingTicket]: ticket.status === "pending",
        })}
      >
        <Tooltip
          arrow
          placement="right"
          title={ticket.queue?.name || "Sem fila"}
        >
          <span
            style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }}
            className={classes.ticketQueueColor}
          ></span>
        </Tooltip>
        <ListItemAvatar>
          <Avatar 
            src={ticket?.contact?.profilePicUrl} 
            className={classes.avatar}
          />
        </ListItemAvatar>
        <div className={classes.ticketInfo}>
          <div className={classes.contactNameWrapper}>
            <Typography
              noWrap
              component="span"
              className={classes.contactName}
            >
              {ticket.contact.name}
            </Typography>
            <div style={{ display: "flex", alignItems: "center" }}>
              {ticket.status === "closed" && (
                <Chip
                  label="FECHADO"
                  size="small"
                  className={clsx(classes.statusChip, classes.closedChip)}
                />
              )}
              {ticket.lastMessage && (
                <Typography
                  className={classes.lastMessageTime}
                  component="span"
                >
                  {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                    <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                  ) : (
                    <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                  )}
                </Typography>
              )}
              {ticket.unreadMessages > 0 && (
                <Badge
                  className={classes.newMessagesCount}
                  badgeContent={ticket.unreadMessages}
                  classes={{
                    badge: classes.unreadBadge,
                  }}
                />
              )}
            </div>
          </div>
          <Typography
            className={classes.lastMessage}
            component="span"
          >
            <MarkdownWrapper>{renderLastMessage()}</MarkdownWrapper>
          </Typography>
        </div>
        {ticket.status === "pending" && (
          <ButtonWithSpinner
            color="primary"
            variant="contained"
            className={classes.acceptButton}
            size="small"
            loading={loading}
            onClick={(e) => handleAcepptTicket(ticket)}
          >
            {i18n.t("ticketsList.buttons.accept")}
          </ButtonWithSpinner>
        )}
      </ListItem>
      <Divider variant="inset" component="li" />
    </React.Fragment>
  );
};

export default TicketListItem;
