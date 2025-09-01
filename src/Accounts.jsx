import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axiosInstance from './axiosInstance';

// --- Renewed Tailwind Styles (Modern UI) ---
const cardShadow = "shadow-2xl";
const cardRounded = "rounded-2xl";
const cardBg = "bg-white/80 backdrop-blur-md ring-1 ring-inset ring-slate-100";
const cardBorder = "border border-slate-200";
const mainTitle = "text-3xl font-black text-slate-900 tracking-tight";
const secTitle = "text-xl font-bold text-indigo-700";
const btn = "focus:outline-none transition-all duration-150 ease-in-out";
const btnAccent = `${btn} bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white font-semibold rounded-xl px-6 py-2 shadow-lg ring-1 ring-indigo-300/50 hover:ring-2 hover:ring-indigo-400/60`;
const btnOutline = `${btn} border border-indigo-400 text-indigo-700 bg-white hover:bg-slate-50 font-medium rounded-xl px-5 py-2 hover:shadow`;
const btnSm = "text-xs px-3 py-1 rounded-lg";
const btnDanger = `${btn} bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold rounded-lg px-5 py-1.5 shadow ring-1 ring-rose-200/50 hover:ring-rose-400/70`;
const input = "w-full px-4 py-2 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl bg-slate-50 shadow-inner transition placeholder:text-slate-400";
const modalBg = "fixed inset-0 bg-gradient-to-br from-indigo-800/60 to-sky-400/25 flex items-center justify-center z-50 backdrop-blur-sm";
const modalCard = "bg-white/90 rounded-3xl shadow-2xl w-full max-w-lg p-9 relative border-2 border-indigo-100 ring-2 ring-indigo-200/20";
const label = "block text-sm font-semibold text-slate-900 mb-1";
const errorBox = "bg-rose-50 border-l-4 border-rose-400 text-rose-800 px-4 py-2 rounded-lg mb-4 font-medium shadow";
const infoBox = "bg-sky-50 border-l-4 border-sky-400 text-sky-800 px-4 py-2 rounded-lg mb-4 font-medium shadow";
const iconBtn = "hover:scale-110 transition-transform duration-150 focus:outline-none";
const tableHeader = "font-semibold text-slate-800 text-xs md:text-sm uppercase bg-slate-100/60 py-2 tracking-wider";
const responsiveTable = "overflow-x-auto w-full";

// Helper functions for modals
function Modal({ onClose, children, key }) {
    return (
        <div className={modalBg} onClick={onClose} key={key}>
            <div className={modalCard} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {children}
            </div>
        </div>
    );
}
function ModalFooter({ onCancel, onDelete, deleteLabel = "Delete", onPrimary, primaryLabel = "Save" }) {
    return (
        <div className="flex justify-end gap-3 mt-5">
            <button type="button" onClick={onCancel} className={`${btnOutline}`}>
                Cancel
            </button>
            {onDelete && (
                <button type="button" onClick={onDelete} className={`${btnDanger}`}>
                    {deleteLabel}
                </button>
            )}
            {onPrimary && (
                <button type="submit" onClick={onPrimary} className={`${btnAccent}`}>
                    {primaryLabel}
                </button>
            )}
        </div>
    );
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
function getBackendError(err, defaultMsg) {
    if (err.response && err.response.data) {
        if (err.response.data.detail) {
            return err.response.data.detail;
        }
        if (typeof err.response.data === 'string') {
            return err.response.data;
        }
        let errorMsg = '';
        for (const key in err.response.data) {
            errorMsg += `${key}: ${err.response.data[key].join(', ')}\n`;
        }
        return errorMsg.trim() || defaultMsg;
    }
    return defaultMsg;
}

export default function Accounts({ user }) {
    const navigate = useNavigate();

    const handleBack = () => { navigate('/admin'); };

    const [expenseSheets, setExpenseSheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSheetId, setSelectedSheetId] = useState(null);

    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [showEditSheet, setShowEditSheet] = useState(false);
    const [editingSheet, setEditingSheet] = useState(null);
    const [showDeleteSheet, setShowDeleteSheet] = useState(false);
    const [deletingSheet, setDeletingSheet] = useState(null);
    const [newSheetMonth, setNewSheetMonth] = useState('');
    const [newSheetYear, setNewSheetYear] = useState('');
    const [editSheetMonth, setEditSheetMonth] = useState('');
    const [editSheetYear, setEditSheetYear] = useState('');
    const [editSheetIsApproved, setEditSheetIsApproved] = useState('false');

    const [expenseHeads, setExpenseHeads] = useState([]);
    const [showCreateHead, setShowCreateHead] = useState(false);
    const [showEditHead, setShowEditHead] = useState(false);
    const [showDeleteHead, setShowDeleteHead] = useState(false);
    const [editingHead, setEditingHead] = useState(null);
    const [deletingHead, setDeletingHead] = useState(null);
    const [newHeadName, setNewHeadName] = useState('');
    const [expandedHeadId, setExpandedHeadId] = useState(null);

    const [showCreateSubHead, setShowCreateSubHead] = useState(false);
    const [showEditSubHead, setShowEditSubHead] = useState(false);
    const [showDeleteSubHead, setShowDeleteSubHead] = useState(false);
    const [editingSubHead, setEditingSubHead] = useState(null);
    const [deletingSubHead, setDeletingSubHead] = useState(null);
    const [subHeadSheetId, setSubHeadSheetId] = useState(null);
    const [subHeadMainHeadId, setSubHeadMainHeadId] = useState(null);
    const [newSubHeadName, setNewSubHeadName] = useState('');
    const [subHeadError, setSubHeadError] = useState(null);

    const [showCreateItem, setShowCreateItem] = useState(false);
    const [itemSheetId, setItemSheetId] = useState(null);
    const [itemSubHeadId, setItemSubHeadId] = useState(null);
    const [itemSubHeadSelectOpen, setItemSubHeadSelectOpen] = useState(false);
    const [itemForm, setItemForm] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        expense_type: '',
        purchased_by: '',
        paid_at: '',
        approved_by: '',
        bill_image: null
    });
    const [itemError, setItemError] = useState(null);

    const [showEditItem, setShowEditItem] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showDeleteItem, setShowDeleteItem] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);
    const [editItemForm, setEditItemForm] = useState(null);

    const [showImageModal, setShowImageModal] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState(null);

    const [showSheetSearch, setShowSheetSearch] = useState(false);
    const [searchYear, setSearchYear] = useState('');
    const [searchMonth, setSearchMonth] = useState('');
    const [filteredSheet, setFilteredSheet] = useState(null);

    const [sheetPage, setSheetPage] = useState(1);
    const sheetsPerPage = 5;
    const [expensePage, setExpensePage] = useState({});
    const expensesPerPage = 4;

    const [showExpensesPage, setShowExpensesPage] = useState(false);
    const [sheetForExpenses, setSheetForExpenses] = useState(null);
    const [selectedHeadForExpenses, setSelectedHeadForExpenses] = useState(null);

    useEffect(() => {
        fetchSheets();
        fetchHeads();
    }, []);

    async function fetchSheets() {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/sheets/');
            setExpenseSheets(res.data);
        } catch (err) {
            setError(getBackendError(err, 'Failed to fetch expense sheets.'));
        } finally {
            setLoading(false);
        }
    }

    async function fetchHeads() {
        try {
            const res = await axiosInstance.get('/expense-heads/');
            setExpenseHeads(res.data);
        } catch {}
    }

    function openCreateSheet() { setShowCreateSheet(true); setError(null); setNewSheetMonth(''); setNewSheetYear(''); }
    function closeCreateSheet() { setShowCreateSheet(false); setError(null); }
    async function handleCreateSheet(e) {
        e.preventDefault();
        setError(null);
        try {
            const body = {
                month: parseInt(newSheetMonth),
                year: parseInt(newSheetYear),
                is_approved: false
            };
            await axiosInstance.post('/sheets/', body);
            setShowCreateSheet(false);
            fetchSheets();
        } catch (err) {
            setError(getBackendError(err, 'Failed to create sheet'));
        }
    }
    function openEditSheet(sheet) {
        setEditingSheet(sheet);
        setEditSheetMonth(sheet.month);
        setEditSheetYear(sheet.year);
        setEditSheetIsApproved(sheet.is_approved ? 'true' : 'false');
        setShowEditSheet(true);
        setError(null);
    }
    function closeEditSheet() { 
        setEditingSheet(null); 
        setEditSheetMonth('');
        setEditSheetYear('');
        setEditSheetIsApproved('false');
        setShowEditSheet(false); 
        setError(null); 
    }
    async function handleEditSheet(e) {
        e.preventDefault();
        setError(null);
        try {
            const body = {
                month: parseInt(editSheetMonth),
                year: parseInt(editSheetYear),
                is_approved: editSheetIsApproved === 'true'
            };
            await axiosInstance.patch(`/sheets/${editingSheet.id}/`, body);
            setShowEditSheet(false);
            setEditingSheet(null);
            fetchSheets();
        } catch (err) {
            setError(getBackendError(err, 'Failed to edit sheet'));
        }
    }
    function openDeleteSheet(sheet) { setDeletingSheet(sheet); setShowDeleteSheet(true); setError(null); }
    function closeDeleteSheet() { setDeletingSheet(null); setShowDeleteSheet(false); setError(null); }
    async function handleDeleteSheet() {
        if (!deletingSheet) return;
        try {
            await axiosInstance.delete(`/sheets/${deletingSheet.id}/`);
            setShowDeleteSheet(false);
            if (deletingSheet.id === sheetForExpenses?.id) {
                setShowExpensesPage(false);
                setSheetForExpenses(null);
            }
            fetchSheets();
        } catch (err) {
            setError(getBackendError(err, 'Failed to delete sheet'));
        }
    }

    function openCreateHead() { setShowCreateHead(true); setNewHeadName(''); setError(null); }
    function closeCreateHead() { setShowCreateHead(false); setNewHeadName(''); setError(null); }
    async function handleCreateHead(e) {
        e.preventDefault();
        setError(null);
        try {
            await axiosInstance.post('/expense-heads/', { name: newHeadName });
            setShowCreateHead(false);
            fetchHeads();
            fetchSheets();
        } catch (err) {
            setError(getBackendError(err, 'Failed to create main head'));
        }
    }
    function openEditHead(head) { setEditingHead(head); setNewHeadName(head.name); setShowEditHead(true); setError(null); }
    function closeEditHead() { setEditingHead(null); setNewHeadName(''); setShowEditHead(false); setError(null); }
    async function handleEditHead(e) {
        e.preventDefault();
        setError(null);
        try {
            await axiosInstance.patch(`/expense-heads/${editingHead.id}/`, { name: newHeadName });
            closeEditHead();
            fetchHeads();
            fetchSheets();
        } catch (err) {
            setError(getBackendError(err, 'Failed to edit main head'));
        }
    }
    function openDeleteHead(head) { setDeletingHead(head); setShowDeleteHead(true); setError(null); }
    function closeDeleteHead() { setDeletingHead(null); setShowDeleteHead(false); setError(null); }
    async function handleDeleteHead() {
        if (!deletingHead) return;
        try {
            await axiosInstance.delete(`/expense-heads/${deletingHead.id}/`);
            closeDeleteHead();
            fetchHeads();
            fetchSheets();
        } catch (err) {
            setError(getBackendError(err, 'Failed to delete main head'));
        }
    }

    function openCreateSubHead(sheetId, headId) {
        setSubHeadSheetId(sheetId);
        setSubHeadMainHeadId(headId);
        setShowCreateSubHead(true);
        setNewSubHeadName('');
        setSubHeadError(null);
        setError(null);
    }
    function closeCreateSubHead() {
        setShowCreateSubHead(false);
        setNewSubHeadName('');
        setSubHeadError(null);
        setError(null);
    }
    async function handleCreateSubHead(e) {
        e.preventDefault();
        setSubHeadError(null);
        setError(null);
        try {
            await axiosInstance.post('/sub-expense-heads/', {
                name: newSubHeadName,
                expense_head: subHeadMainHeadId,
                monthly_sheet: subHeadSheetId
            });
            setShowCreateSubHead(false);
            fetchSheets();
        } catch (err) {
            setSubHeadError(getBackendError(err, 'Failed to create sub category'));
        }
    }
    function openEditSubHead(subHead) {
        setEditingSubHead(subHead);
        setNewSubHeadName(subHead.name);
        setSubHeadSheetId(subHead.monthly_sheet);
        setSubHeadMainHeadId(subHead.expense_head);
        setShowEditSubHead(true);
        setSubHeadError(null);
        setError(null);
    }
    function closeEditSubHead() {
        setEditingSubHead(null);
        setNewSubHeadName('');
        setShowEditSubHead(false);
        setSubHeadError(null);
        setError(null);
    }
    async function handleEditSubHead(e) {
        e.preventDefault();
        setSubHeadError(null);
        setError(null);
        try {
            await axiosInstance.patch(`/sub-expense-heads/${editingSubHead.id}/`, {
                name: newSubHeadName,
                expense_head: subHeadMainHeadId,
                monthly_sheet: subHeadSheetId
            });
            closeEditSubHead();
            fetchSheets();
        } catch (err) {
            setSubHeadError(getBackendError(err, 'Failed to edit sub head'));
        }
    }
    function openDeleteSubHead(subHead) {
        setDeletingSubHead(subHead);
        setShowDeleteSubHead(true);
        setError(null);
    }
    function closeDeleteSubHead() {
        setDeletingSubHead(null);
        setShowDeleteSubHead(false);
        setError(null);
    }
    async function handleDeleteSubHead() {
        if (!deletingSubHead) return;
        try {
            await axiosInstance.delete(`/sub-expense-heads/${deletingSubHead.id}/`);
            closeDeleteSubHead();
            fetchSheets();
        } catch (err) {
            setError(getBackendError(err, 'Failed to delete sub head'));
        }
    }

    function openCreateItem(sheetId) {
        setItemSheetId(sheetId);
        setItemSubHeadId(null);
        setShowCreateItem(true);
        setItemSubHeadSelectOpen(true);
        setItemForm({
            date: new Date().toISOString().split('T')[0],
            amount: '',
            expense_type: '',
            purchased_by: '',
            paid_at: '',
            approved_by: '',
            bill_image: null
        });
        setItemError(null);
    }
    function closeCreateItem() {
        setShowCreateItem(false);
        setItemSheetId(null);
        setItemSubHeadId(null);
        setItemError(null);
    }
    async function handleCreateItem(e) {
        e.preventDefault();
        if (!itemSubHeadId) {
            setItemError('Please select or create a sub category first.');
            return;
        }
        const formData = new FormData();
        formData.append('date', itemForm.date);
        formData.append('amount', itemForm.amount);
        formData.append('expense_type', itemForm.expense_type || 'expense');
        formData.append('purchased_by', itemForm.purchased_by);
        formData.append('paid_at', itemForm.paid_at);
        formData.append('approved_by', itemForm.approved_by);
        formData.append('sub_expense_head', itemSubHeadId);
        if (itemForm.bill_image) formData.append('bill_image', itemForm.bill_image);
        try {
            await axiosInstance.post('/expense-items/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            closeCreateItem();
            fetchSheets();
        } catch (err) {
            setItemError(getBackendError(err, 'Failed to create expense item'));
        }
    }

    function openEditExpenseItem(item) {
        setEditingItem(item);
        setEditItemForm({
            date: item.date,
            amount: item.amount,
            expense_type: item.expense_type,
            purchased_by: item.purchased_by,
            paid_at: item.paid_at,
            approved_by: item.approved_by,
            bill_image: null,
        });
        setShowEditItem(true);
        setItemError(null);
    }
    function closeEditExpenseItem() {
        setEditingItem(null);
        setShowEditItem(false);
        setItemError(null);
        setEditItemForm(null);
    }
    async function handleEditExpenseItem(e) {
        e.preventDefault();
        if (!editingItem) return;
        const formData = new FormData();
        formData.append('date', editItemForm.date);
        formData.append('amount', editItemForm.amount);
        formData.append('expense_type', editItemForm.expense_type);
        formData.append('purchased_by', editItemForm.purchased_by);
        formData.append('paid_at', editItemForm.paid_at);
        formData.append('approved_by', editItemForm.approved_by);
        formData.append('sub_expense_head', editingItem.sub?.id || editingItem.sub_expense_head);
        if (editItemForm.bill_image) {
            formData.append('bill_image', editItemForm.bill_image);
        }
        try {
            await axiosInstance.patch(`/expense-items/${editingItem.id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            closeEditExpenseItem();
            fetchSheets();
        } catch (err) {
            setItemError(getBackendError(err, 'Failed to update expense item'));
        }
    }
    function openDeleteExpenseItem(item) {
        setDeletingItem(item);
        setShowDeleteItem(true);
        setItemError(null);
    }
    function closeDeleteExpenseItem() {
        setDeletingItem(null);
        setShowDeleteItem(false);
        setItemError(null);
    }
    async function handleDeleteExpenseItem() {
        if (!deletingItem) return;
        try {
            await axiosInstance.delete(`/expense-items/${deletingItem.id}/`);
            closeDeleteExpenseItem();
            fetchSheets();
        } catch (err) {
            setItemError(getBackendError(err, 'Failed to delete expense item'));
        }
    }

    function openImageModal(imageUrl) {
        setModalImageSrc(imageUrl);
        setShowImageModal(true);
    }
    function closeImageModal() {
        setModalImageSrc(null);
        setShowImageModal(false);
    }

    function handleSheetSearch(e) {
        e.preventDefault();
        const y = parseInt(searchYear, 10);
        const m = parseInt(searchMonth, 10);
        if (!y || !m) return;
        const found = expenseSheets.find(s => s.year === y && s.month === m);
        setFilteredSheet(found || null);
        setShowSheetSearch(false);
        setSheetPage(1);
        if (found) {
            setSelectedSheetId(found.id);
        }
    }
    function clearFilter() {
        setFilteredSheet(null);
        setSearchYear('');
        setSearchMonth('');
        setSelectedSheetId(null);
    }

    const totalSheetPages = filteredSheet ? 1 : Math.ceil(expenseSheets.length / sheetsPerPage) || 1;
    const shownSheets = filteredSheet
        ? (filteredSheet ? [filteredSheet] : [])
        : expenseSheets.slice((sheetPage - 1) * sheetsPerPage, sheetPage * sheetsPerPage);

    const selectedSheet = expenseSheets.find(s => s.id === selectedSheetId) || null;

    function SheetBlock({ sheet }) {
        return (
            <div className={`${cardBg} ${cardShadow} ${cardRounded} ${cardBorder} p-7 mb-10 hover:scale-[1.01] transition-transform duration-200 group`}>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-100 pb-4 mb-4 gap-2">
                    <div>
                        <div className="text-2xl font-extrabold text-indigo-900 flex items-center gap-2">
                            <svg className="w-7 h-7 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
                            </svg>
                            Sheet {sheet.month}/{sheet.year}
                        </div>
                        <div className={sheet.is_approved ? "text-emerald-700 font-semibold mt-1" : "text-orange-700 font-semibold mt-1"}>
                            {sheet.is_approved ?
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-emerald-500 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="9" strokeWidth="2"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                                    </svg> Approved
                                </span>
                                : <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-orange-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="9" strokeWidth="2"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
                                    </svg> Not Approved
                                </span>
                            }
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button className={`${btnOutline} ${btnSm} hover:bg-slate-100`} onClick={() => openEditSheet(sheet)}><i className="fa fa-edit mr-1"></i>Edit</button>
                        <button className={`${btnDanger} ${btnSm}`} onClick={() => openDeleteSheet(sheet)}><i className="fa fa-trash mr-1"></i>Delete</button>
                        <button className={`${btnAccent} ${btnSm}`} onClick={() => openCreateItem(sheet.id)}><i className="fa fa-plus mr-1"></i>Add Expense Item</button>
                        <button className={`${btnOutline} ${btnSm}`} onClick={() => { setSheetForExpenses(sheet); setShowExpensesPage(true); }}>
                            <i className="fa fa-list mr-1"></i>See Expenses
                        </button>
                    </div>
                </div>
                <div className="text-base text-indigo-700 mb-2 font-bold">
                    Total: <span className="text-emerald-700">{formatCurrency(sheet.total_monthly_expense)}</span>
                </div>
                <div className="font-bold text-indigo-800 mt-2 mb-2">Main Expense Heads:</div>
                {sheet.main_heads_in_sheet.length > 0 ? (
                    sheet.main_heads_in_sheet.map(head => (
                        <div key={head.id} className="cursor-pointer" onClick={() => setExpandedHeadId(expandedHeadId === head.id ? null : head.id)}>
                            <div className="flex items-center gap-4 text-base mb-1 pl-2 py-1 hover:bg-slate-100 rounded-lg transition">
                                <span className="font-semibold text-slate-900">{head.name}</span>
                                <span className="text-emerald-700 font-bold">{formatCurrency(head.total_expense)}</span>
                                <button onClick={(e) => { e.stopPropagation(); openEditHead(head); }} className={`${iconBtn} text-indigo-700 text-xs`} title="Edit"><i className="fa fa-edit"></i></button>
                                <button onClick={(e) => { e.stopPropagation(); openDeleteHead(head); }} className={`${iconBtn} text-rose-600 text-xs`} title="Delete"><i className="fa fa-trash"></i></button>
                                <svg className={`w-4 h-4 text-indigo-400 ml-auto transition-transform ${expandedHeadId === head.id ? 'rotate-90' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            {expandedHeadId === head.id && (
                                <div className="ml-2 md:ml-8 mt-2 space-y-2 border-l-2 border-indigo-200 pl-2 md:pl-4 py-2 bg-indigo-50/60 rounded-lg">
                                    <h4 className="text-sm font-bold text-indigo-800">Sub-Categories:</h4>
                                    {(head.sub_heads_in_head || []).length > 0 ? (
                                        (head.sub_heads_in_head || []).map(subHead => (
                                            <div key={subHead.id} className="flex items-center text-xs text-indigo-700">
                                                <span className="font-medium mr-2">{subHead.name}</span>
                                                <button onClick={(e) => { e.stopPropagation(); openEditSubHead(subHead); }} className={`${iconBtn} text-indigo-600`} title="Edit"><i className="fa fa-edit"></i></button>
                                                <button onClick={(e) => { e.stopPropagation(); openDeleteSubHead(subHead); }} className={`${iconBtn} text-rose-600 ml-2`} title="Delete"><i className="fa fa-trash"></i></button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-xs text-slate-400">No sub-categories.</div>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); openCreateSubHead(sheet.id, head.id); }} className={`${btnOutline} ${btnSm} mt-2 text-xs`}>
                                        <i className="fa fa-plus mr-1"></i> Add Sub-Head
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-slate-400 text-sm">No main heads.</div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                    <button className={`${btnOutline} text-xs font-semibold`} onClick={openCreateHead}>
                        <i className="fa fa-plus mr-1"></i> Add Main Expense Head
                    </button>
                </div>
                <hr className="my-5 border-slate-100" />
            </div>
        );
    }

    function ExpensesPage({ sheet, onBack }) {
        if (!sheet) return null;
        const mainHeads = sheet.main_heads_in_sheet || [];

        function ExpensesTable({ expenses }) {
            return (
                <div>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        <div className={responsiveTable}>
                            <table className="min-w-full w-full bg-white rounded-2xl shadow mb-2">
                                <thead>
                                    <tr>
                                        <th className={tableHeader}>Date</th>
                                        <th className={tableHeader}>Amount</th>
                                        <th className={tableHeader}>Type</th>
                                        <th className={tableHeader}>Purchased By</th>
                                        <th className={tableHeader}>Paid At</th>
                                        <th className={tableHeader}>Approved By</th>
                                        <th className={tableHeader}>Sub Category</th>
                                        <th className={tableHeader}>Image</th>
                                        <th className={tableHeader}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.length > 0 ? expenses.map(item => (
                                        <tr key={item.id} className="border-t border-slate-100/70 text-sm hover:bg-slate-50 transition-colors">
                                            <td className="px-3 py-2 text-center text-slate-700">{item.date}</td>
                                            <td className="px-3 py-2 text-center text-emerald-700 font-medium">{formatCurrency(item.amount)}</td>
                                            <td className="px-3 py-2 text-center text-slate-700 capitalize">{item.expense_type}</td>
                                            <td className="px-3 py-2 text-center text-slate-700">{item.purchased_by}</td>
                                            <td className="px-3 py-2 text-center text-slate-700">{item.paid_at}</td>
                                            <td className="px-3 py-2 text-center text-slate-700">{item.approved_by}</td>
                                            <td className="px-3 py-2 text-center text-indigo-700 font-medium">{item.sub.name}</td>
                                            <td className="px-3 py-2 text-center">
                                                {item.bill_image && (
                                                    <button onClick={() => openImageModal(item.bill_image)} className="focus:outline-none">
                                                        <img src={item.bill_image} alt="Bill" className="w-10 h-10 object-cover border border-slate-200 rounded-md shadow inline-block cursor-pointer" />
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <div className="flex gap-2 justify-center items-center">
                                                    <button onClick={() => openEditExpenseItem(item)} className={`${iconBtn} text-indigo-700 text-xs md:text-sm`} title="Edit"><i className="fa fa-edit"></i></button>
                                                    <button onClick={() => openDeleteExpenseItem(item)} className={`${iconBtn} text-rose-600 text-xs md:text-sm`} title="Delete"><i className="fa fa-trash"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="9" className="text-center py-4 text-slate-400">No expenses found for this head.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Mobile Grid */}
                    <div className="md:hidden flex flex-col gap-4">
                        {expenses.length > 0 ? expenses.map(item => (
                            <div key={item.id} className="bg-white/90 border border-slate-200 rounded-xl shadow p-4 flex flex-col gap-1">
                                <div className="flex flex-wrap gap-x-4 gap-y-2 items-center mb-2">
                                    <span className="font-bold text-indigo-700">{item.sub.name}</span>
                                    <span className="text-emerald-700 font-bold">{formatCurrency(item.amount)}</span>
                                    <span className="text-xs text-slate-400">({item.date})</span>
                                </div>
                                <div className="text-sm text-slate-800"><b>Type:</b> {item.expense_type}</div>
                                <div className="text-sm text-slate-800"><b>Purchased By:</b> {item.purchased_by}</div>
                                <div className="text-sm text-slate-800"><b>Paid At:</b> {item.paid_at}</div>
                                <div className="text-sm text-slate-800"><b>Approved By:</b> {item.approved_by}</div>
                                {item.bill_image && (
                                    <div className="mt-2 flex flex-col items-start gap-1">
                                        <button
                                            onClick={() => openImageModal(item.bill_image)}
                                            className="relative focus:outline-none group"
                                        >
                                            <img
                                                src={item.bill_image}
                                                alt="Bill"
                                                className="w-20 h-20 object-cover border border-slate-200 rounded-lg shadow cursor-pointer"
                                            />
                                            <span className="absolute bottom-1 right-1 bg-indigo-700 bg-opacity-80 text-white text-xs px-2 py-0.5 rounded group-hover:scale-110 transition-transform">
                                                View
                                            </span>
                                        </button>
                                    </div>
                                )}
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => openEditExpenseItem(item)} className={`${iconBtn} text-indigo-700 text-xs`} title="Edit"><i className="fa fa-edit"></i></button>
                                    <button onClick={() => openDeleteExpenseItem(item)} className={`${iconBtn} text-rose-600 text-xs`} title="Delete"><i className="fa fa-trash"></i></button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-slate-400 bg-white/80 border border-slate-100 p-6 rounded-xl">No expenses found for this head.</div>
                        )}
                    </div>
                </div>
            );
        }

        const handleHeadSelect = (head) => {
            setSelectedHeadForExpenses(head);
            setExpensePage(prev => ({ ...prev, [head.id]: 1 }));
        };

        const currentHead = selectedHeadForExpenses;
        const subHeadsForCurrentHead = currentHead ? currentHead.sub_heads_in_head : [];
        let allExpenses = [];
        subHeadsForCurrentHead.forEach(sub => {
            if (sub.items && sub.items.length) {
                allExpenses = allExpenses.concat(sub.items.map(item => ({ ...item, sub })));
            }
        });
        
        // Sort expenses by date in descending order
        allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        const page = expensePage[currentHead?.id] || 1;
        const totalPages = Math.ceil(allExpenses.length / expensesPerPage) || 1;
        const shownExpenses = allExpenses.slice((page - 1) * expensesPerPage, page * expensesPerPage);

        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-100 p-4 md:p-8 flex flex-col items-center">
                <div className="w-full max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                        <button onClick={onBack} className="text-indigo-700 font-semibold flex items-center text-base md:text-lg" >
                            <svg className="w-5 h-5 md:w-6 md:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                            </svg> <span className="hidden md:inline">Back to Sheets</span>
                            <span className="md:hidden">Sheets</span>
                        </button>
                        <h2 className={mainTitle + " text-center flex-1"}>Expenses for Sheet {sheet.month}/{sheet.year}</h2>
                        <div className="w-12" />
                    </div>
                    <div className={`${cardBg} ${cardShadow} ${cardRounded} ${cardBorder} p-4 md:p-8 mb-4`}>
                        <h3 className="text-lg md:text-xl font-bold text-indigo-800 mb-3">Main Expense Heads:</h3>
                        <div className="flex flex-wrap gap-2">
                            {mainHeads.length > 0 ? mainHeads.map(head => (
                                <button
                                    key={head.id}
                                    onClick={() => handleHeadSelect(head)}
                                    className={`${btnOutline} ${selectedHeadForExpenses?.id === head.id ? 'bg-indigo-100 font-bold' : ''}`}
                                >
                                    {head.name}
                                </button>
                            )) : (
                                <p className="text-slate-400">No main heads found for this sheet.</p>
                            )}
                        </div>
                    </div>
                    {selectedHeadForExpenses && (
                        <div className={`${cardBg} ${cardShadow} ${cardRounded} ${cardBorder} p-4 md:p-8`}>
                            <div className="font-bold text-indigo-900 mb-3 text-xl flex flex-col md:flex-row md:items-center md:gap-4">
                                <span>Expenses for: {selectedHeadForExpenses.name}</span>
                                <span className="text-sm font-normal text-indigo-600 mt-1 md:mt-0">Total: <span className="font-bold text-emerald-700">{formatCurrency(selectedHeadForExpenses.total_expense)}</span></span>
                            </div>
                            <ExpensesTable expenses={shownExpenses} />
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={() => setExpensePage(prev => ({ ...prev, [currentHead.id]: prev[currentHead.id] - 1 }))}
                                    disabled={page === 1}
                                    className={`${btnOutline} ${btnSm} mr-2 disabled:opacity-50`}
                                >
                                    Previous
                                </button>
                                <span className="text-slate-700 font-semibold px-4 py-1.5">{page} / {totalPages}</span>
                                <button
                                    onClick={() => setExpensePage(prev => ({ ...prev, [currentHead.id]: prev[currentHead.id] + 1 }))}
                                    disabled={page === totalPages}
                                    className={`${btnOutline} ${btnSm} ml-2 disabled:opacity-50`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {showImageModal && modalImageSrc && (
                    <Modal onClose={closeImageModal} key="image-modal">
                        <h3 className={secTitle + " mb-4"}>Bill Image</h3>
                        <img src={modalImageSrc} alt="Bill" className="max-w-full h-auto rounded-lg shadow-lg mx-auto" style={{maxHeight: '70vh'}} />
                        <div className="text-center mt-2">
                            <a
                                href={modalImageSrc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${btnAccent} mt-2`}
                                download
                            >
                                View Full Size / Download
                            </a>
                        </div>
                    </Modal>
                )}
            </div>
        );
    }

    if (showExpensesPage && sheetForExpenses) {
        return <ExpensesPage sheet={sheetForExpenses} onBack={() => setShowExpensesPage(false)} />;
    }

    if (loading) return <div className="text-center p-8 text-indigo-700 font-semibold">Loading...</div>;
    if (!user) return <Navigate to="/login" replace={true} />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-100 p-4 md:p-8">
            <div className="w-full max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6 md:mb-10">
                    <button onClick={handleBack} className="text-indigo-700 font-semibold flex items-center text-base md:text-lg">
                        <svg className="w-5 h-5 md:w-6 md:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg> Back
                    </button>
                    <h1 className={mainTitle}>Manage Sheets</h1>
                    <button onClick={openCreateSheet} className={`${btnAccent}`}>
                        <i className="fa fa-plus mr-1"></i> New Sheet
                    </button>
                </div>
                {error && <div className={errorBox}>{error}</div>}

                {/* Search Bar */}
                <div className={`${cardBg} ${cardShadow} ${cardRounded} ${cardBorder} p-5 mb-6 flex flex-col md:flex-row items-center gap-4`}>
                    <h3 className="font-semibold text-slate-800 text-lg md:text-xl">Find a Specific Sheet:</h3>
                    <form onSubmit={handleSheetSearch} className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 items-center">
                        <input
                            type="text"
                            placeholder="Year (e.g., 2025)"
                            value={searchYear}
                            onChange={e => setSearchYear(e.target.value)}
                            className={input}
                        />
                        <input
                            type="text"
                            placeholder="Month (e.g., 8)"
                            value={searchMonth}
                            onChange={e => setSearchMonth(e.target.value)}
                            className={input}
                        />
                        <button type="submit" className={btnAccent + ' md:w-auto w-full'}>
                            <i className="fa fa-search mr-1"></i> Search
                        </button>
                        {filteredSheet && (
                            <button type="button" onClick={clearFilter} className={`${btnOutline} md:w-auto w-full`}>
                                Clear Filter
                            </button>
                        )}
                    </form>
                </div>

                {shownSheets.length > 0 ? (
                    shownSheets.map(sheet => <SheetBlock key={sheet.id} sheet={sheet} />)
                ) : (
                    <div className={`${cardBg} ${cardShadow} ${cardRounded} ${cardBorder} p-10 text-center text-slate-500 font-medium`}>
                        No expense sheets found.
                    </div>
                )}

                {totalSheetPages > 1 && !filteredSheet && (
                    <div className="flex justify-center mt-8">
                        <button onClick={() => setSheetPage(p => Math.max(1, p - 1))} className={`${btnOutline} ${btnSm} mr-2`} disabled={sheetPage === 1}>
                            Previous
                        </button>
                        <span className="text-slate-700 font-semibold px-4 py-1.5">{sheetPage} / {totalSheetPages}</span>
                        <button onClick={() => setSheetPage(p => Math.min(totalSheetPages, p + 1))} className={`${btnOutline} ${btnSm} ml-2`} disabled={sheetPage === totalSheetPages}>
                            Next
                        </button>
                    </div>
                )}

                {/* Modals for different CRUD operations */}
                {showCreateSheet && (
                    <Modal onClose={closeCreateSheet} key="create-sheet-modal">
                        <h3 className={secTitle + " mb-4"}>Create New Sheet</h3>
                        {error && <div className={errorBox}>{error}</div>}
                        <form onSubmit={handleCreateSheet}>
                            <div className="mb-3">
                                <label className={label} htmlFor="month">Month</label>
                                <input type="number" name="month" id="month" className={input} value={newSheetMonth} onChange={e => setNewSheetMonth(e.target.value)} required />
                            </div>
                            <div className="mb-4">
                                <label className={label} htmlFor="year">Year</label>
                                <input type="number" name="year" id="year" className={input} value={newSheetYear} onChange={e => setNewSheetYear(e.target.value)} required />
                            </div>
                            <ModalFooter onCancel={closeCreateSheet} onPrimary={handleCreateSheet} primaryLabel="Create Sheet" />
                        </form>
                    </Modal>
                )}
                {showEditSheet && editingSheet && (
                    <Modal onClose={closeEditSheet} key="edit-sheet-modal">
                        <h3 className={secTitle + " mb-4"}>Edit Sheet {editingSheet.month}/{editingSheet.year}</h3>
                        {error && <div className={errorBox}>{error}</div>}
                        <form onSubmit={handleEditSheet}>
                            <div className="mb-3">
                                <label className={label} htmlFor="month-edit">Month</label>
                                <input
                                    type="number"
                                    name="month"
                                    id="month-edit"
                                    className={input}
                                    value={editSheetMonth}
                                    onChange={e => setEditSheetMonth(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className={label} htmlFor="year-edit">Year</label>
                                <input
                                    type="number"
                                    name="year"
                                    id="year-edit"
                                    className={input}
                                    value={editSheetYear}
                                    onChange={e => setEditSheetYear(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className={label} htmlFor="is-approved">Is Approved?</label>
                                <select
                                    name="is_approved"
                                    id="is-approved"
                                    className={input}
                                    value={editSheetIsApproved}
                                    onChange={e => setEditSheetIsApproved(e.target.value)}
                                >
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>
                            <ModalFooter onCancel={closeEditSheet} onPrimary={handleEditSheet} primaryLabel="Save Changes" />
                        </form>
                    </Modal>
                )}
                {showDeleteSheet && deletingSheet && (
                    <Modal onClose={closeDeleteSheet} key="delete-sheet-modal">
                        <h3 className={secTitle + " mb-4"}>Delete Sheet</h3>
                        <p className="mb-5 text-indigo-900 font-medium">Are you sure you want to delete sheet {deletingSheet.month}/{deletingSheet.year}?</p>
                        <ModalFooter onCancel={closeDeleteSheet} onDelete={handleDeleteSheet} deleteLabel="Delete" />
                    </Modal>
                )}
                {showCreateHead && (
                    <Modal onClose={closeCreateHead} key="create-head-modal">
                        <h3 className={secTitle + " mb-4"}>Create New Main Expense Head</h3>
                        {error && <div className={errorBox}>{error}</div>}
                        <form onSubmit={handleCreateHead}>
                            <div className="mb-4">
                                <label className={label} htmlFor="head-name">Head Name</label>
                                <input type="text" name="name" id="head-name" className={input} value={newHeadName} onChange={e => setNewHeadName(e.target.value)} required />
                            </div>
                            <ModalFooter onCancel={closeCreateHead} onPrimary={handleCreateHead} primaryLabel="Create Head" />
                        </form>
                    </Modal>
                )}
                {showEditHead && editingHead && (
                    <Modal onClose={closeEditHead} key="edit-head-modal">
                        <h3 className={secTitle + " mb-4"}>Edit Main Expense Head</h3>
                        {error && <div className={errorBox}>{error}</div>}
                        <form onSubmit={handleEditHead}>
                            <div className="mb-4">
                                <label className={label} htmlFor="head-name-edit">Head Name</label>
                                <input type="text" name="name" id="head-name-edit" className={input} value={newHeadName} onChange={e => setNewHeadName(e.target.value)} required />
                            </div>
                            <ModalFooter onCancel={closeEditHead} onPrimary={handleEditHead} primaryLabel="Save Changes" />
                        </form>
                    </Modal>
                )}
                {showDeleteHead && deletingHead && (
                    <Modal onClose={closeDeleteHead} key="delete-head-modal">
                        <h3 className={secTitle + " mb-4"}>Delete Main Expense Head</h3>
                        <p className="mb-5 text-indigo-900 font-medium">Are you sure you want to delete the head "{deletingHead.name}"?</p>
                        <ModalFooter onCancel={closeDeleteHead} onDelete={handleDeleteHead} deleteLabel="Delete" />
                    </Modal>
                )}
                {showCreateSubHead && (
                    <Modal onClose={closeCreateSubHead} key="create-sub-head-modal">
                        <h3 className={secTitle + " mb-4"}>Create New Sub-Category</h3>
                        {subHeadError && <div className={errorBox}>{subHeadError}</div>}
                        <form onSubmit={handleCreateSubHead}>
                            <div className="mb-4">
                                <label className={label} htmlFor="sub-head-name">Sub-Category Name</label>
                                <input type="text" name="name" id="sub-head-name" className={input} value={newSubHeadName} onChange={e => setNewSubHeadName(e.target.value)} required />
                            </div>
                            <ModalFooter onCancel={closeCreateSubHead} onPrimary={handleCreateSubHead} primaryLabel="Create Sub-Category" />
                        </form>
                    </Modal>
                )}
                {showEditSubHead && editingSubHead && (
                    <Modal onClose={closeEditSubHead} key="edit-sub-head-modal">
                        <h3 className={secTitle + " mb-4"}>Edit Sub-Category</h3>
                        {subHeadError && <div className={errorBox}>{subHeadError}</div>}
                        <form onSubmit={handleEditSubHead}>
                            <div className="mb-4">
                                <label className={label} htmlFor="sub-head-name-edit">Sub-Category Name</label>
                                <input type="text" name="name" id="sub-head-name-edit" className={input} value={newSubHeadName} onChange={e => setNewSubHeadName(e.target.value)} required />
                            </div>
                            <ModalFooter onCancel={closeEditSubHead} onPrimary={handleEditSubHead} primaryLabel="Save Changes" />
                        </form>
                    </Modal>
                )}
                {showDeleteSubHead && deletingSubHead && (
                    <Modal onClose={closeDeleteSubHead} key="delete-sub-head-modal">
                        <h3 className={secTitle + " mb-4"}>Delete Sub-Category</h3>
                        <p className="mb-5 text-indigo-900 font-medium">Are you sure you want to delete the sub-category "{deletingSubHead.name}"?</p>
                        <ModalFooter onCancel={closeDeleteSubHead} onDelete={handleDeleteSubHead} deleteLabel="Delete" />
                    </Modal>
                )}
                {showCreateItem && (
                    <Modal onClose={closeCreateItem} key="create-item-modal">
                        <h3 className={secTitle + " mb-4"}>Add Expense Item</h3>
                        {itemError && <div className={errorBox}>{itemError}</div>}
                        <form onSubmit={handleCreateItem}>
                            <div className="mb-3">
                                <label className={label}>Sub Category</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        className={`${input} flex justify-between items-center`}
                                        onClick={() => setItemSubHeadSelectOpen(!itemSubHeadSelectOpen)}
                                    >
                                        <span>{itemSubHeadId ? expenseSheets.find(s => s.id === itemSheetId).sub_heads_in_sheet.find(sh => sh.id === itemSubHeadId)?.name : 'Select a Sub-Category'}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {itemSubHeadSelectOpen && (
                                        <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                                            {expenseSheets.find(s => s.id === itemSheetId)?.sub_heads_in_sheet.map(sub => (
                                                <li key={sub.id} className="p-3 hover:bg-slate-100 cursor-pointer text-sm text-slate-800"
                                                    onClick={() => { setItemSubHeadId(sub.id); setItemSubHeadSelectOpen(false); }}>
                                                    {sub.name} ({sub.expense_head_name})
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className={label}>Date</label>
                                <input type="date" name="date" className={input} value={itemForm.date} onChange={e => setItemForm({ ...itemForm, date: e.target.value })} required />
                            </div>
                            <div className="mb-3">
                                <label className={label}>Amount</label>
                                <input type="number" name="amount" className={input} value={itemForm.amount} onChange={e => setItemForm({ ...itemForm, amount: e.target.value })} required />
                            </div>
                            <div className="mb-3">
                                <label className={label}>Expense Type</label>
                                <input type="text" name="expense_type" className={input} value={itemForm.expense_type} onChange={e => setItemForm({ ...itemForm, expense_type: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className={label}>Purchased By</label>
                                <input type="text" name="purchased_by" className={input} value={itemForm.purchased_by} onChange={e => setItemForm({ ...itemForm, purchased_by: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className={label}>Paid At</label>
                                <input type="text" name="paid_at" className={input} value={itemForm.paid_at} onChange={e => setItemForm({ ...itemForm, paid_at: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className={label}>Approved By</label>
                                <input type="text" name="approved_by" className={input} value={itemForm.approved_by} onChange={e => setItemForm({ ...itemForm, approved_by: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className={label}>Bill Image</label>
                                <input type="file" name="bill_image" accept="image/*" className={input} onChange={e => setItemForm({ ...itemForm, bill_image: e.target.files[0] })} />
                                {itemForm.bill_image && typeof itemForm.bill_image === 'object' && (
                                    <div className="mt-2">
                                        <span className="text-xs text-indigo-700">Selected Image: </span>
                                        <img src={URL.createObjectURL(itemForm.bill_image)} alt="Preview" className="w-20 h-20 object-cover border border-slate-200 rounded-lg shadow inline-block cursor-pointer" onClick={() => openImageModal(URL.createObjectURL(itemForm.bill_image))} />
                                    </div>
                                )}
                            </div>
                            <ModalFooter onCancel={closeCreateItem} onPrimary={handleCreateItem} primaryLabel="Create Item" />
                        </form>
                    </Modal>
                )}
                {showEditItem && editingItem && editItemForm && (
                    <Modal onClose={closeEditExpenseItem} key="edit-item-modal">
                        <h3 className={secTitle + " mb-4"}>Edit Expense Item</h3>
                        {itemError && <div className={errorBox}>{itemError}</div>}
                        <form onSubmit={handleEditExpenseItem}>
                            <div className="mb-3">
                                <label className={label}>Date</label>
                                <input type="date" name="date" className={input} value={editItemForm.date} onChange={e => setEditItemForm({ ...editItemForm, date: e.target.value })} required />
                            </div>
                            <div className="mb-3">
                                <label className={label}>Amount</label>
                                <input type="number" name="amount" className={input} value={editItemForm.amount} onChange={e => setEditItemForm({ ...editItemForm, amount: e.target.value })} required />
                            </div>
                            <div className="mb-3">
                                <label className={label}>Expense Type</label>
                                <input type="text" name="expense_type" className={input} value={editItemForm.expense_type} onChange={e => setEditItemForm({ ...editItemForm, expense_type: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className={label}>Purchased By</label>
                                <input type="text" name="purchased_by" className={input} value={editItemForm.purchased_by} onChange={e => setEditItemForm({ ...editItemForm, purchased_by: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className={label}>Paid At</label>
                                <input type="text" name="paid_at" className={input} value={editItemForm.paid_at} onChange={e => setEditItemForm({ ...editItemForm, paid_at: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className={label}>Approved By</label>
                                <input type="text" name="approved_by" className={input} value={editItemForm.approved_by} onChange={e => setEditItemForm({ ...editItemForm, approved_by: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className={label}>Bill Image</label>
                                <input
                                    type="file"
                                    name="bill_image"
                                    accept="image/*"
                                    className={input}
                                    onChange={e => setEditItemForm({ ...editItemForm, bill_image: e.target.files[0] })}
                                />
                                {/* Always show current uploaded image */}
                                {editingItem.bill_image && (
                                    <div className="mt-2">
                                        <span className="text-xs text-indigo-700">Current Image: </span>
                                        <img
                                            src={editingItem.bill_image}
                                            alt="Bill"
                                            className="w-20 h-20 object-cover border border-slate-200 rounded-lg shadow inline-block cursor-pointer"
                                            onClick={() => openImageModal(editingItem.bill_image)}
                                        />
                                        <div className="mt-1">
                                            <a
                                                href={editingItem.bill_image}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`${btnAccent} mt-1`}
                                                download
                                            >
                                                View Full Size / Download
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {/* Show preview if user selected a new file */}
                                {editItemForm.bill_image && typeof editItemForm.bill_image === 'object' && (
                                    <div className="mt-2">
                                        <span className="text-xs text-indigo-700">New Image (to upload): </span>
                                        <img src={URL.createObjectURL(editItemForm.bill_image)} alt="Preview" className="w-20 h-20 object-cover border border-slate-200 rounded-lg shadow inline-block cursor-pointer" onClick={() => openImageModal(URL.createObjectURL(editItemForm.bill_image))} />
                                    </div>
                                )}
                            </div>
                            <ModalFooter onCancel={closeEditExpenseItem} />
                        </form>
                    </Modal>
                )}
                {showDeleteItem && deletingItem && (
                    <Modal onClose={closeDeleteExpenseItem} key="delete-item-modal">
                        <h3 className={secTitle + " mb-4"}>Delete Expense Item</h3>
                        <p className="mb-5 text-indigo-900 font-medium">Are you sure you want to delete this expense item?</p>
                        <ModalFooter onCancel={closeDeleteExpenseItem} onDelete={handleDeleteExpenseItem} deleteLabel="Delete" />
                    </Modal>
                )}
                {showImageModal && modalImageSrc && (
                    <Modal onClose={closeImageModal} key="image-modal">
                        <h3 className={secTitle + " mb-4"}>Bill Image</h3>
                        <img src={modalImageSrc} alt="Bill" className="max-w-full h-auto rounded-lg shadow-lg" style={{maxHeight: '70vh'}} />
                        <div className="text-center mt-2">
                            <a
                                href={modalImageSrc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${btnAccent} mt-2`}
                                download
                            >
                                View Full Size / Download
                            </a>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    );
}