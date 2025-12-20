import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles, createTheme, ThemeProvider } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { MoreVert, Replay, Search } from "@material-ui/icons";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import TicketOptionsMenu from "../TicketOptionsMenu";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import UndoRoundedIcon from '@material-ui/icons/UndoRounded';
import Tooltip from '@material-ui/core/Tooltip';
import { green, red } from '@material-ui/core/colors';
import CancelIcon from '@material-ui/icons/Cancel';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";


const useStyles = makeStyles(theme => ({
	actionButtons: {
		marginRight: 6,
		flex: "none",
		alignSelf: "center",
		marginLeft: "auto",
		"& > *": {
			margin: theme.spacing(0.5),
		},
	},
}));

const TicketActionButtonsCustom = ({ ticket, onSearchToggle }) => {
	const classes = useStyles();
	const history = useHistory();
	const [anchorEl, setAnchorEl] = useState(null);
	const [loading, setLoading] = useState(false);
	const ticketOptionsMenuOpen = Boolean(anchorEl);
	const [returnModalOpen, setReturnModalOpen] = useState(false);
	const [returnReason, setReturnReason] = useState("");
	const [returnError, setReturnError] = useState("");
	const { user } = useContext(AuthContext);
	const { setCurrentTicket } = useContext(TicketsContext);

	const customTheme = createTheme({
		palette: {
		  	primary: green,
		}
	});

	const handleOpenTicketOptionsMenu = e => {
		setAnchorEl(e.currentTarget);
	};

	const handleCloseTicketOptionsMenu = e => {
		setAnchorEl(null);
	};

	const handleUpdateTicketStatus = async (e, status, userId) => {
		setLoading(true);
		try {
			await api.put(`/tickets/${ticket.id}`, {
				status: status,
				userId: userId || null,
				useIntegration: status === "closed" ? false : ticket.useIntegration,
				promptId: status === "closed" ? false : ticket.promptId,
				integrationId: status === "closed" ? false : ticket.integrationId
			});

			setLoading(false);
			if (status === "open") {
				setCurrentTicket({ ...ticket, code: "#open" });
			} else {
				setCurrentTicket({ id: null, code: null })
				history.push("/tickets");
			}
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
	};

	const handleOpenReturnModal = () => {
		setReturnModalOpen(true);
		setReturnReason("");
		setReturnError("");
	};

	const handleCloseReturnModal = () => {
		setReturnModalOpen(false);
		setReturnReason("");
		setReturnError("");
	};

	const handleConfirmReturn = async () => {
		if (returnReason.trim().length < 10) {
			setReturnError("O motivo deve ter no mínimo 10 caracteres");
			return;
		}
		handleCloseReturnModal();
		await handleUpdateTicketStatus(null, "pending", null);
	};

	const handleEncerrarTicket = async () => {
		setLoading(true);
		try {
			await api.put(`/tickets2/${ticket.id}`, {
				status: "closed",
				userId: user?.id,
				useIntegration: false,
				promptId: false,
				integrationId: false
			});

			setLoading(false);
			setCurrentTicket({ id: null, code: null });
			history.push("/tickets");
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
	};

	return (
		<>
			<Dialog open={returnModalOpen} onClose={handleCloseReturnModal} maxWidth="sm" fullWidth>
				<DialogTitle style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "white" }}>
					Motivo do Retorno
				</DialogTitle>
				<DialogContent style={{ marginTop: "20px" }}>
					<TextField
						autoFocus
						margin="dense"
						label="Por que você está retornando este chamado?"
						type="text"
						fullWidth
						multiline
						rows={4}
						variant="outlined"
						value={returnReason}
						onChange={(e) => {
							setReturnReason(e.target.value);
							if (e.target.value.trim().length >= 10) {
								setReturnError("");
							}
						}}
						error={!!returnError}
						helperText={returnError || `${returnReason.trim().length}/10 caracteres mínimos`}
						placeholder="Digite o motivo do retorno (mínimo 10 caracteres)..."
					/>
				</DialogContent>
				<DialogActions style={{ padding: "16px 24px" }}>
					<Button onClick={handleCloseReturnModal} style={{ color: "#64748b" }}>
						Cancelar
					</Button>
					<Button 
						onClick={handleConfirmReturn} 
						style={{ 
							background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
							color: "white",
							fontWeight: 600
						}}
						disabled={returnReason.trim().length < 10}
					>
						Confirmar Retorno
					</Button>
				</DialogActions>
			</Dialog>

			<div className={classes.actionButtons}>
			{ticket.status === "closed" && (
				<ButtonWithSpinner
					loading={loading}
					startIcon={<Replay />}
					size="small"
					onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
				>
					{i18n.t("messagesList.header.buttons.reopen")}
				</ButtonWithSpinner>
			)}
			{ticket.status === "open" && (
				<>
					<Tooltip title={i18n.t("messageSearch.searchButton")}>
						<IconButton onClick={onSearchToggle}>
							<Search />
						</IconButton>
					</Tooltip>
					<Tooltip title={i18n.t("messagesList.header.buttons.return")}>
						<IconButton onClick={handleOpenReturnModal}>
							<UndoRoundedIcon />
						</IconButton>
					</Tooltip>
					<ThemeProvider theme={customTheme}>
						<Tooltip title={i18n.t("messagesList.header.buttons.resolve")}>
							<IconButton onClick={e => handleUpdateTicketStatus(e, "closed", user?.id)} color="primary">
								<CheckCircleIcon />
							</IconButton>
						</Tooltip>
					</ThemeProvider>
					{user.profile === 'admin' && (
						<Tooltip title="Encerrar">
							<IconButton onClick={handleEncerrarTicket} style={{ color: red[500] }}>
								<CancelIcon />
							</IconButton>
						</Tooltip>
					)}
					{/* <ButtonWithSpinner
						loading={loading}
						startIcon={<Replay />}
						size="small"
						onClick={e => handleUpdateTicketStatus(e, "pending", null)}
					>
						{i18n.t("messagesList.header.buttons.return")}
					</ButtonWithSpinner>
					<ButtonWithSpinner
						loading={loading}
						size="small"
						variant="contained"
						color="primary"
						onClick={e => handleUpdateTicketStatus(e, "closed", user?.id)}
					>
						{i18n.t("messagesList.header.buttons.resolve")}
					</ButtonWithSpinner> */}
					<IconButton onClick={handleOpenTicketOptionsMenu}>
						<MoreVert />
					</IconButton>
					<TicketOptionsMenu
						ticket={ticket}
						anchorEl={anchorEl}
						menuOpen={ticketOptionsMenuOpen}
						handleClose={handleCloseTicketOptionsMenu}
					/>
				</>
			)}
			{ticket.status === "pending" && (
				<ButtonWithSpinner
					loading={loading}
					size="small"
					variant="contained"
					color="primary"
					onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
				>
					{i18n.t("messagesList.header.buttons.accept")}
				</ButtonWithSpinner>
			)}
			</div>
		</>
	);
};

export default TicketActionButtonsCustom;