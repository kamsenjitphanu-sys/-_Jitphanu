import { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard, Package, Users, ArrowLeftRight, History as HistoryIcon,
  Plus, Pencil, Trash2, X, Search, Wrench, CheckCircle2, RotateCcw,
  AlertTriangle, Inbox, Phone, ClipboardList, ArrowRight
} from "lucide-react";

const COLORS = {
  ink: "#1C2B39",
  inkSoft: "#3A4E60",
  paper: "#EDF1F4",
  card: "#FFFFFF",
  border: "#DCE2E7",
  borderStrong: "#C3CCD3",
  amber: "#B9812E",
  amberDeep: "#8C611F",
  amberBg: "#F5E8CE",
  text: "#1C2B39",
  textMuted: "#5C6B7A",
  available: "#1F8A5C",
  availableBg: "#DFF2E8",
  inUse: "#2F5F9E",
  inUseBg: "#E1EBF7",
  maintenance: "#B05A20",
  maintenanceBg: "#F6E4D3",
  retired: "#75808A",
  retiredBg: "#E7E9EB",
  danger: "#B23A3A",
  dangerBg: "#F7E1E1",
};

const STATUS_TH = {
  Available: "พร้อมใช้งาน",
  "In Use": "กำลังใช้งาน",
  "Under Maintenance": "ซ่อมบำรุง",
  Retired: "ปลดระวาง",
};
const STATUS_STYLE = {
  Available: { fg: COLORS.available, bg: COLORS.availableBg },
  "In Use": { fg: COLORS.inUse, bg: COLORS.inUseBg },
  "Under Maintenance": { fg: COLORS.maintenance, bg: COLORS.maintenanceBg },
  Retired: { fg: COLORS.retired, bg: COLORS.retiredBg },
};
const ACTION_TH = { Grant: "เบิกอุปกรณ์", Maintenance: "ซ่อมบำรุง" };
const CATEGORY_SUGGESTIONS = ["คอมพิวเตอร์", "เครื่องพิมพ์", "เฟอร์นิเจอร์", "อุปกรณ์เครือข่าย", "อุปกรณ์สื่อสาร", "เครื่องใช้ไฟฟ้า", "อื่นๆ"];

function genId(prefix) {
  return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function nowIso() {
  return new Date().toISOString();
}
function fmtDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
  } catch (e) {
    return "-";
  }
}
function fmtDateTime(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "-";
  }
}

function Badge({ children, fg, bg }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: fg, background: bg }}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Retired;
  return <Badge fg={s.fg} bg={s.bg}>{STATUS_TH[status] || status}</Badge>;
}

function IconBtn({ onClick, title, children, tone = "default" }) {
  const toneStyle =
    tone === "danger"
      ? { color: COLORS.danger }
      : tone === "amber"
      ? { color: COLORS.amberDeep }
      : { color: COLORS.inkSoft };
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 rounded-md hover:opacity-70 transition"
      style={{ ...toneStyle, background: "transparent" }}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ onClick, children, type = "button", disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: COLORS.ink, color: "#fff" }}
    >
      {children}
    </button>
  );
}

function GhostButton({ onClick, children, tone = "default", type = "button" }) {
  const style =
    tone === "danger"
      ? { color: COLORS.danger, border: `1px solid ${COLORS.dangerBg}`, background: COLORS.dangerBg }
      : tone === "amber"
      ? { color: COLORS.amberDeep, border: `1px solid ${COLORS.amberBg}`, background: COLORS.amberBg }
      : { color: COLORS.ink, border: `1px solid ${COLORS.border}`, background: "#fff" };
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
      style={style}
    >
      {children}
    </button>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.textMuted }}>
      {children} {required && <span style={{ color: COLORS.danger }}>*</span>}
    </label>
  );
}

const inputStyle = {
  border: `1px solid ${COLORS.border}`,
  background: "#fff",
  color: COLORS.text,
};

function Modal({ title, onClose, children, width = "max-w-lg" }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(28,43,57,0.45)" }}
      onClick={onClose}
    >
      <div
        className={`w-full ${width} rounded-2xl shadow-xl max-h-[88vh] overflow-y-auto`}
        style={{ background: COLORS.card }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
          <h3 className="text-base font-bold" style={{ color: COLORS.ink }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:opacity-60">
            <X size={18} style={{ color: COLORS.textMuted }} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: COLORS.amberBg }}>
        <Icon size={26} style={{ color: COLORS.amberDeep }} />
      </div>
      <p className="font-bold text-base mb-1" style={{ color: COLORS.ink }}>{title}</p>
      <p className="text-sm mb-5" style={{ color: COLORS.textMuted }}>{subtitle}</p>
      {actionLabel && (
        <PrimaryButton onClick={onAction}>
          <Plus size={16} /> {actionLabel}
        </PrimaryButton>
      )}
    </div>
  );
}

function StatCard({ label, value, fg, bg, icon: Icon }) {
  return (
    <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: bg }}>
      <div>
        <p className="text-xs font-semibold mb-1" style={{ color: fg, opacity: 0.85 }}>{label}</p>
        <p className="text-2xl font-extrabold" style={{ color: fg }}>{value}</p>
      </div>
      <Icon size={26} style={{ color: fg, opacity: 0.55 }} />
    </div>
  );
}

export default function App() {
  const [data, setData] = useState({ equipment: [], staff: [], transactions: [] });
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [tab, setTab] = useState("dashboard");

  const [equipModal, setEquipModal] = useState(null);
  const [staffModal, setStaffModal] = useState(null);
  const [grantModal, setGrantModal] = useState(null);
  const [returnModal, setReturnModal] = useState(null);
  const [maintModal, setMaintModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [equipSearch, setEquipSearch] = useState("");
  const [equipStatusFilter, setEquipStatusFilter] = useState("All");
  const [staffSearch, setStaffSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("oeis-data", false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          setData({
            equipment: parsed.equipment || [],
            staff: parsed.staff || [],
            transactions: parsed.transactions || [],
          });
        }
      } catch (e) {
        // ยังไม่มีข้อมูลเดิม เริ่มต้นด้วยค่าว่าง
      }
      setLoaded(true);
    })();
  }, []);

  async function persist(next) {
    setData(next);
    try {
      const result = await window.storage.set("oeis-data", JSON.stringify(next), false);
      if (!result) setSaveError("บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      else setSaveError("");
    } catch (e) {
      setSaveError("บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  }

  const staffById = useMemo(() => Object.fromEntries(data.staff.map((s) => [s.id, s])), [data.staff]);
  const equipById = useMemo(() => Object.fromEntries(data.equipment.map((e) => [e.id, e])), [data.equipment]);

  // ---------- Equipment CRUD ----------
  function saveEquipment(form, editingId) {
    if (editingId) {
      const updated = data.equipment.map((e) => (e.id === editingId ? { ...e, ...form } : e));
      persist({ ...data, equipment: updated });
    } else {
      const item = {
        id: genId("eq"),
        asset_code: form.asset_code,
        name: form.name,
        category: form.category,
        status: "Available",
        current_staff_id: null,
        purchase_date: form.purchase_date || null,
        notes: form.notes || "",
        created_at: nowIso(),
      };
      persist({ ...data, equipment: [item, ...data.equipment] });
    }
    setEquipModal(null);
  }
  function deleteEquipment(id) {
    persist({ ...data, equipment: data.equipment.filter((e) => e.id !== id) });
    setConfirmDelete(null);
  }

  // ---------- Staff CRUD ----------
  function saveStaff(form, editingId) {
    if (editingId) {
      const updated = data.staff.map((s) => (s.id === editingId ? { ...s, ...form } : s));
      persist({ ...data, staff: updated });
    } else {
      const item = {
        id: genId("st"),
        employee_code: form.employee_code,
        full_name: form.full_name,
        department: form.department,
        position: form.position,
        phone: form.phone || "",
        status: "Active",
      };
      persist({ ...data, staff: [item, ...data.staff] });
    }
    setStaffModal(null);
  }
  function deleteStaff(id) {
    persist({ ...data, staff: data.staff.filter((s) => s.id !== id) });
    setConfirmDelete(null);
  }

  // ---------- Grant / Return / Maintenance ----------
  function grantEquipment({ equipmentId, staffId, expectedReturnDate, remarks }) {
    const tx = {
      id: genId("tx"),
      equipment_id: equipmentId,
      staff_id: staffId,
      action_type: "Grant",
      action_date: nowIso(),
      expected_return_date: expectedReturnDate || null,
      actual_return_date: null,
      remarks: remarks || "",
    };
    const equipment = data.equipment.map((e) =>
      e.id === equipmentId ? { ...e, status: "In Use", current_staff_id: staffId } : e
    );
    persist({ ...data, equipment, transactions: [tx, ...data.transactions] });
    setGrantModal(null);
  }

  function returnEquipment(equipmentId, remarks) {
    const openTx = [...data.transactions]
      .filter((t) => t.equipment_id === equipmentId && t.action_type === "Grant" && !t.actual_return_date)
      .sort((a, b) => new Date(b.action_date) - new Date(a.action_date))[0];
    const transactions = data.transactions.map((t) =>
      openTx && t.id === openTx.id
        ? { ...t, actual_return_date: nowIso(), remarks: remarks ? `${t.remarks ? t.remarks + " / " : ""}คืน: ${remarks}` : t.remarks }
        : t
    );
    const equipment = data.equipment.map((e) =>
      e.id === equipmentId ? { ...e, status: "Available", current_staff_id: null } : e
    );
    persist({ ...data, equipment, transactions });
    setReturnModal(null);
  }

  function startMaintenance(equipmentId, remarks) {
    const tx = {
      id: genId("tx"),
      equipment_id: equipmentId,
      staff_id: null,
      action_type: "Maintenance",
      action_date: nowIso(),
      expected_return_date: null,
      actual_return_date: null,
      remarks: `ส่งซ่อมบำรุง${remarks ? ": " + remarks : ""}`,
    };
    const equipment = data.equipment.map((e) => (e.id === equipmentId ? { ...e, status: "Under Maintenance" } : e));
    persist({ ...data, equipment, transactions: [tx, ...data.transactions] });
    setMaintModal(null);
  }

  function completeMaintenance(equipmentId, remarks) {
    const tx = {
      id: genId("tx"),
      equipment_id: equipmentId,
      staff_id: null,
      action_type: "Maintenance",
      action_date: nowIso(),
      expected_return_date: null,
      actual_return_date: nowIso(),
      remarks: `ซ่อมบำรุงเสร็จสิ้น${remarks ? ": " + remarks : ""}`,
    };
    const equipment = data.equipment.map((e) => (e.id === equipmentId ? { ...e, status: "Available" } : e));
    persist({ ...data, equipment, transactions: [tx, ...data.transactions] });
    setMaintModal(null);
  }

  // ---------- Derived views ----------
  const filteredEquipment = data.equipment.filter((e) => {
    const q = equipSearch.trim().toLowerCase();
    const matchQ = !q || e.asset_code.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || (e.category || "").toLowerCase().includes(q);
    const matchStatus = equipStatusFilter === "All" || e.status === equipStatusFilter;
    return matchQ && matchStatus;
  });
  const filteredStaff = data.staff.filter((s) => {
    const q = staffSearch.trim().toLowerCase();
    return !q || s.full_name.toLowerCase().includes(q) || s.employee_code.toLowerCase().includes(q) || (s.department || "").toLowerCase().includes(q);
  });
  const availableEquipment = data.equipment.filter((e) => e.status === "Available");
  const inUseEquipment = data.equipment.filter((e) => e.status === "In Use");
  const activeStaff = data.staff.filter((s) => s.status === "Active");
  const recentTx = [...data.transactions].sort((a, b) => new Date(b.action_date) - new Date(a.action_date)).slice(0, 6);
  const categoryCounts = data.equipment.reduce((acc, e) => {
    const k = e.category || "ไม่ระบุ";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  if (!loaded) {
    return (
      <div className="w-full flex items-center justify-center py-24" style={{ color: COLORS.textMuted }}>
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  const NAV = [
    { id: "dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
    { id: "equipment", label: "อุปกรณ์", icon: Package },
    { id: "staff", label: "บุคลากร", icon: Users },
    { id: "grant", label: "เบิก-คืนอุปกรณ์", icon: ArrowLeftRight },
    { id: "history", label: "ประวัติการทำรายการ", icon: HistoryIcon },
  ];

  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: COLORS.paper, fontFamily: "'Noto Sans Thai', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');`}</style>
      <div className="flex flex-col md:flex-row min-h-[640px]">
        {/* Sidebar */}
        <div className="md:w-60 shrink-0 p-4 flex md:flex-col gap-1" style={{ background: COLORS.ink }}>
          <div className="px-2 py-3 mb-2 hidden md:block">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: COLORS.amber }}>
                <ClipboardList size={17} color={COLORS.ink} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white leading-tight">คลังอุปกรณ์สำนักงาน</p>
                <p className="text-[11px]" style={{ color: "#8FA0B0" }}>Office Equipment Inventory</p>
              </div>
            </div>
          </div>
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible w-full">
            {NAV.map((n) => {
              const active = tab === n.id;
              const Icon = n.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => setTab(n.id)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition shrink-0"
                  style={{
                    background: active ? COLORS.amber : "transparent",
                    color: active ? COLORS.ink : "#C7D2DB",
                  }}
                >
                  <Icon size={17} />
                  {n.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-5 md:p-7" style={{ background: COLORS.paper }}>
          {saveError && (
            <div className="mb-4 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2" style={{ background: COLORS.dangerBg, color: COLORS.danger }}>
              <AlertTriangle size={16} /> {saveError}
            </div>
          )}

          {tab === "dashboard" && (
            <DashboardView
              equipment={data.equipment}
              staff={data.staff}
              activeStaffCount={activeStaff.length}
              recentTx={recentTx}
              equipById={equipById}
              staffById={staffById}
              categoryCounts={categoryCounts}
              onGoTo={setTab}
            />
          )}

          {tab === "equipment" && (
            <EquipmentView
              equipment={filteredEquipment}
              totalCount={data.equipment.length}
              search={equipSearch}
              setSearch={setEquipSearch}
              statusFilter={equipStatusFilter}
              setStatusFilter={setEquipStatusFilter}
              staffById={staffById}
              onAdd={() => setEquipModal({})}
              onEdit={(e) => setEquipModal(e)}
              onDelete={(e) => setConfirmDelete({ type: "equipment", id: e.id, label: `${e.asset_code} · ${e.name}` })}
              onGrant={(e) => setGrantModal({ equipmentId: e.id })}
              onReturn={(e) => setReturnModal(e)}
              onMaintStart={(e) => setMaintModal({ equipment: e, action: "start" })}
              onMaintComplete={(e) => setMaintModal({ equipment: e, action: "complete" })}
            />
          )}

          {tab === "staff" && (
            <StaffView
              staff={filteredStaff}
              totalCount={data.staff.length}
              search={staffSearch}
              setSearch={setStaffSearch}
              onAdd={() => setStaffModal({})}
              onEdit={(s) => setStaffModal(s)}
              onDelete={(s) => setConfirmDelete({ type: "staff", id: s.id, label: `${s.employee_code} · ${s.full_name}` })}
            />
          )}

          {tab === "grant" && (
            <GrantView
              availableEquipment={availableEquipment}
              inUseEquipment={inUseEquipment}
              activeStaff={activeStaff}
              staffById={staffById}
              onGrant={grantEquipment}
              onReturn={(e) => setReturnModal(e)}
            />
          )}

          {tab === "history" && (
            <HistoryView transactions={data.transactions} equipById={equipById} staffById={staffById} />
          )}
        </div>
      </div>

      {equipModal && (
        <EquipmentModal
          initial={equipModal}
          onClose={() => setEquipModal(null)}
          onSave={saveEquipment}
        />
      )}
      {staffModal && (
        <StaffModal initial={staffModal} onClose={() => setStaffModal(null)} onSave={saveStaff} />
      )}
      {grantModal && (
        <GrantModal
          preset={grantModal}
          availableEquipment={availableEquipment}
          activeStaff={activeStaff}
          onClose={() => setGrantModal(null)}
          onSubmit={grantEquipment}
        />
      )}
      {returnModal && (
        <ReturnModal
          equipment={returnModal}
          staffById={staffById}
          onClose={() => setReturnModal(null)}
          onSubmit={(remarks) => returnEquipment(returnModal.id, remarks)}
        />
      )}
      {maintModal && (
        <MaintenanceModal
          equipment={maintModal.equipment}
          action={maintModal.action}
          onClose={() => setMaintModal(null)}
          onSubmit={(remarks) =>
            maintModal.action === "start"
              ? startMaintenance(maintModal.equipment.id, remarks)
              : completeMaintenance(maintModal.equipment.id, remarks)
          }
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          label={confirmDelete.label}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() =>
            confirmDelete.type === "equipment" ? deleteEquipment(confirmDelete.id) : deleteStaff(confirmDelete.id)
          }
        />
      )}
    </div>
  );
}

// ================= Dashboard =================
function DashboardView({ equipment, staff, activeStaffCount, recentTx, equipById, staffById, categoryCounts, onGoTo }) {
  const total = equipment.length;
  const available = equipment.filter((e) => e.status === "Available").length;
  const inUse = equipment.filter((e) => e.status === "In Use").length;
  const maintenance = equipment.filter((e) => e.status === "Under Maintenance").length;
  const maxCat = Math.max(1, ...Object.values(categoryCounts));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold" style={{ color: COLORS.ink }}>แดชบอร์ด</h1>
        <p className="text-sm" style={{ color: COLORS.textMuted }}>ภาพรวมอุปกรณ์และการเบิก-คืนของสำนักงาน</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-7">
        <StatCard label="อุปกรณ์ทั้งหมด" value={total} fg={COLORS.ink} bg="#fff" icon={Package} />
        <StatCard label="พร้อมใช้งาน" value={available} fg={COLORS.available} bg={COLORS.availableBg} icon={CheckCircle2} />
        <StatCard label="กำลังใช้งาน" value={inUse} fg={COLORS.inUse} bg={COLORS.inUseBg} icon={ArrowLeftRight} />
        <StatCard label="ซ่อมบำรุง" value={maintenance} fg={COLORS.maintenance} bg={COLORS.maintenanceBg} icon={Wrench} />
        <StatCard label="บุคลากรที่ใช้งานอยู่" value={activeStaffCount} fg={COLORS.amberDeep} bg={COLORS.amberBg} icon={Users} />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${COLORS.border}` }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ color: COLORS.ink }}>รายการล่าสุด</h2>
            <button onClick={() => onGoTo("history")} className="text-xs font-semibold flex items-center gap-1" style={{ color: COLORS.amberDeep }}>
              ดูทั้งหมด <ArrowRight size={13} />
            </button>
          </div>
          {recentTx.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: COLORS.textMuted }}>ยังไม่มีรายการทำธุรกรรม</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentTx.map((t) => {
                const eq = equipById[t.equipment_id];
                const st = staffById[t.staff_id];
                return (
                  <div key={t.id} className="flex items-center justify-between text-sm py-1.5" style={{ borderBottom: `1px solid ${COLORS.paper}` }}>
                    <div>
                      <p className="font-semibold" style={{ color: COLORS.ink }}>
                        {eq ? eq.name : "(อุปกรณ์ถูกลบแล้ว)"} {st ? `→ ${st.full_name}` : ""}
                      </p>
                      <p className="text-xs" style={{ color: COLORS.textMuted }}>{fmtDateTime(t.action_date)} · {t.remarks || "-"}</p>
                    </div>
                    <Badge fg={t.action_type === "Grant" ? COLORS.inUse : COLORS.maintenance} bg={t.action_type === "Grant" ? COLORS.inUseBg : COLORS.maintenanceBg}>
                      {ACTION_TH[t.action_type] || t.action_type}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${COLORS.border}` }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: COLORS.ink }}>อุปกรณ์แยกตามประเภท</h2>
          {Object.keys(categoryCounts).length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: COLORS.textMuted }}>ยังไม่มีข้อมูลอุปกรณ์</p>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span style={{ color: COLORS.ink }}>{cat}</span>
                      <span style={{ color: COLORS.textMuted }}>{count}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: COLORS.paper }}>
                      <div className="h-full rounded-full" style={{ width: `${(count / maxCat) * 100}%`, background: COLORS.amber }} />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ================= Equipment =================
function AssetTag({ code }) {
  return (
    <span
      className="inline-block px-2 py-1 rounded-md text-xs font-semibold tracking-wide"
      style={{ fontFamily: "'IBM Plex Mono', monospace", background: COLORS.paper, color: COLORS.inkSoft, border: `1px dashed ${COLORS.borderStrong}` }}
    >
      {code}
    </span>
  );
}

function EquipmentView({ equipment, totalCount, search, setSearch, statusFilter, setStatusFilter, staffById, onAdd, onEdit, onDelete, onGrant, onReturn, onMaintStart, onMaintComplete }) {
  return (
    <div>
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: COLORS.ink }}>อุปกรณ์สำนักงาน</h1>
          <p className="text-sm" style={{ color: COLORS.textMuted }}>จัดการรายการอุปกรณ์และสถานะการใช้งานทั้งหมด</p>
        </div>
        <PrimaryButton onClick={onAdd}><Plus size={16} /> เพิ่มอุปกรณ์ใหม่</PrimaryButton>
      </div>

      {totalCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[220px]" style={{ background: "#fff", border: `1px solid ${COLORS.border}` }}>
            <Search size={15} style={{ color: COLORS.textMuted }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหารหัสครุภัณฑ์ ชื่อ หรือประเภท"
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: COLORS.text }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={inputStyle}
          >
            <option value="All">ทุกสถานะ</option>
            <option value="Available">พร้อมใช้งาน</option>
            <option value="In Use">กำลังใช้งาน</option>
            <option value="Under Maintenance">ซ่อมบำรุง</option>
            <option value="Retired">ปลดระวาง</option>
          </select>
        </div>
      )}

      {totalCount === 0 ? (
        <div className="rounded-2xl" style={{ background: "#fff", border: `1px solid ${COLORS.border}` }}>
          <EmptyState icon={Package} title="ยังไม่มีอุปกรณ์ในระบบ" subtitle="เริ่มต้นด้วยการเพิ่มอุปกรณ์สำนักงานชิ้นแรกของคุณ" actionLabel="เพิ่มอุปกรณ์ใหม่" onAction={onAdd} />
        </div>
      ) : equipment.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={{ background: "#fff", border: `1px solid ${COLORS.border}`, color: COLORS.textMuted }}>
          ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไขการค้นหา
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${COLORS.border}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: COLORS.paper }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: COLORS.textMuted }}>รหัสครุภัณฑ์</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: COLORS.textMuted }}>ชื่ออุปกรณ์</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell" style={{ color: COLORS.textMuted }}>ประเภท</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: COLORS.textMuted }}>สถานะ</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell" style={{ color: COLORS.textMuted }}>ผู้ถือครองปัจจุบัน</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: COLORS.textMuted }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((e) => {
                const holder = e.current_staff_id ? staffById[e.current_staff_id] : null;
                return (
                  <tr key={e.id} style={{ borderTop: `1px solid ${COLORS.paper}` }}>
                    <td className="px-4 py-3"><AssetTag code={e.asset_code} /></td>
                    <td className="px-4 py-3 font-semibold" style={{ color: COLORS.ink }}>{e.name}</td>
                    <td className="px-4 py-3 hidden md:table-cell" style={{ color: COLORS.textMuted }}>{e.category || "-"}</td>
                    <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                    <td className="px-4 py-3 hidden lg:table-cell" style={{ color: COLORS.textMuted }}>{holder ? holder.full_name : "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end items-center gap-1 flex-wrap">
                        {e.status === "Available" && (
                          <>
                            <GhostButton tone="default" onClick={() => onGrant(e)}><ArrowLeftRight size={13} /> เบิก</GhostButton>
                            <GhostButton tone="amber" onClick={() => onMaintStart(e)}><Wrench size={13} /> ส่งซ่อม</GhostButton>
                          </>
                        )}
                        {e.status === "In Use" && (
                          <GhostButton tone="default" onClick={() => onReturn(e)}><RotateCcw size={13} /> รับคืน</GhostButton>
                        )}
                        {e.status === "Under Maintenance" && (
                          <GhostButton tone="default" onClick={() => onMaintComplete(e)}><CheckCircle2 size={13} /> ซ่อมเสร็จแล้ว</GhostButton>
                        )}
                        <IconBtn title="แก้ไข" onClick={() => onEdit(e)}><Pencil size={15} /></IconBtn>
                        <IconBtn title="ลบ" tone="danger" onClick={() => onDelete(e)}><Trash2 size={15} /></IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EquipmentModal({ initial, onClose, onSave }) {
  const editing = !!initial.id;
  const [form, setForm] = useState({
    asset_code: initial.asset_code || "",
    name: initial.name || "",
    category: initial.category || "",
    purchase_date: initial.purchase_date || "",
    notes: initial.notes || "",
    status: initial.status || "Available",
  });
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.asset_code.trim() || !form.name.trim()) {
      setError("กรุณากรอกรหัสครุภัณฑ์และชื่ออุปกรณ์");
      return;
    }
    onSave(form, initial.id);
  }

  return (
    <Modal title={editing ? "แก้ไขอุปกรณ์" : "เพิ่มอุปกรณ์ใหม่"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <div className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: COLORS.dangerBg, color: COLORS.danger }}>{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel required>รหัสครุภัณฑ์</FieldLabel>
            <input value={form.asset_code} onChange={(e) => setForm({ ...form, asset_code: e.target.value })} placeholder="เช่น EQ-0001" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <FieldLabel>ประเภท</FieldLabel>
            <input list="cat-list" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="เลือกหรือพิมพ์ประเภท" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
            <datalist id="cat-list">
              {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>
        <div>
          <FieldLabel required>ชื่ออุปกรณ์</FieldLabel>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น โน้ตบุ๊ก Dell Latitude" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>วันที่จัดซื้อ</FieldLabel>
            <input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>
          {editing && (
            <div>
              <FieldLabel>สถานะ</FieldLabel>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
                <option value="Available">พร้อมใช้งาน</option>
                <option value="In Use">กำลังใช้งาน</option>
                <option value="Under Maintenance">ซ่อมบำรุง</option>
                <option value="Retired">ปลดระวาง</option>
              </select>
            </div>
          )}
        </div>
        <div>
          <FieldLabel>หมายเหตุ</FieldLabel>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <GhostButton onClick={onClose}>ยกเลิก</GhostButton>
          <PrimaryButton type="submit">{editing ? "บันทึกการแก้ไข" : "เพิ่มอุปกรณ์"}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

// ================= Staff =================
function StaffView({ staff, totalCount, search, setSearch, onAdd, onEdit, onDelete }) {
  return (
    <div>
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: COLORS.ink }}>บุคลากร</h1>
          <p className="text-sm" style={{ color: COLORS.textMuted }}>จัดการข้อมูลพนักงานผู้ใช้งานระบบ</p>
        </div>
        <PrimaryButton onClick={onAdd}><Plus size={16} /> เพิ่มบุคลากรใหม่</PrimaryButton>
      </div>

      {totalCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4" style={{ background: "#fff", border: `1px solid ${COLORS.border}` }}>
          <Search size={15} style={{ color: COLORS.textMuted }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหารหัสพนักงาน ชื่อ หรือแผนก"
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: COLORS.text }}
          />
        </div>
      )}

      {totalCount === 0 ? (
        <div className="rounded-2xl" style={{ background: "#fff", border: `1px solid ${COLORS.border}` }}>
          <EmptyState icon={Users} title="ยังไม่มีข้อมูลบุคลากร" subtitle="เพิ่มพนักงานเพื่อเริ่มเบิกอุปกรณ์ได้" actionLabel="เพิ่มบุคลากรใหม่" onAction={onAdd} />
        </div>
      ) : staff.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={{ background: "#fff", border: `1px solid ${COLORS.border}`, color: COLORS.textMuted }}>
          ไม่พบบุคลากรที่ตรงกับเงื่อนไขการค้นหา
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${COLORS.border}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: COLORS.paper }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: COLORS.textMuted }}>รหัสพนักงาน</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: COLORS.textMuted }}>ชื่อ-นามสกุล</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell" style={{ color: COLORS.textMuted }}>แผนก</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell" style={{ color: COLORS.textMuted }}>ตำแหน่ง</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell" style={{ color: COLORS.textMuted }}>เบอร์ติดต่อ</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: COLORS.textMuted }}>สถานะ</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: COLORS.textMuted }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} style={{ borderTop: `1px solid ${COLORS.paper}` }}>
                  <td className="px-4 py-3"><AssetTag code={s.employee_code} /></td>
                  <td className="px-4 py-3 font-semibold" style={{ color: COLORS.ink }}>{s.full_name}</td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: COLORS.textMuted }}>{s.department || "-"}</td>
                  <td className="px-4 py-3 hidden lg:table-cell" style={{ color: COLORS.textMuted }}>{s.position || "-"}</td>
                  <td className="px-4 py-3 hidden lg:table-cell" style={{ color: COLORS.textMuted }}>
                    {s.phone ? <span className="inline-flex items-center gap-1"><Phone size={12} />{s.phone}</span> : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge fg={s.status === "Active" ? COLORS.available : COLORS.retired} bg={s.status === "Active" ? COLORS.availableBg : COLORS.retiredBg}>
                      {s.status === "Active" ? "ใช้งานอยู่" : "ไม่ใช้งาน"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <IconBtn title="แก้ไข" onClick={() => onEdit(s)}><Pencil size={15} /></IconBtn>
                      <IconBtn title="ลบ" tone="danger" onClick={() => onDelete(s)}><Trash2 size={15} /></IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StaffModal({ initial, onClose, onSave }) {
  const editing = !!initial.id;
  const [form, setForm] = useState({
    employee_code: initial.employee_code || "",
    full_name: initial.full_name || "",
    department: initial.department || "",
    position: initial.position || "",
    phone: initial.phone || "",
    status: initial.status || "Active",
  });
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.employee_code.trim() || !form.full_name.trim()) {
      setError("กรุณากรอกรหัสพนักงานและชื่อ-นามสกุล");
      return;
    }
    onSave(form, initial.id);
  }

  return (
    <Modal title={editing ? "แก้ไขข้อมูลบุคลากร" : "เพิ่มบุคลากรใหม่"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <div className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: COLORS.dangerBg, color: COLORS.danger }}>{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel required>รหัสพนักงาน</FieldLabel>
            <input value={form.employee_code} onChange={(e) => setForm({ ...form, employee_code: e.target.value })} placeholder="เช่น EMP-001" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <FieldLabel required>ชื่อ-นามสกุล</FieldLabel>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="ชื่อ นามสกุล" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>แผนก</FieldLabel>
            <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="เช่น ฝ่ายบุคคล" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <FieldLabel>ตำแหน่ง</FieldLabel>
            <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="เช่น เจ้าหน้าที่" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>เบอร์ติดต่อ</FieldLabel>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0xx-xxx-xxxx" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>
          {editing && (
            <div>
              <FieldLabel>สถานะ</FieldLabel>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
                <option value="Active">ใช้งานอยู่</option>
                <option value="Inactive">ไม่ใช้งาน</option>
              </select>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <GhostButton onClick={onClose}>ยกเลิก</GhostButton>
          <PrimaryButton type="submit">{editing ? "บันทึกการแก้ไข" : "เพิ่มบุคลากร"}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

// ================= Grant / Return =================
function GrantView({ availableEquipment, inUseEquipment, activeStaff, staffById, onGrant, onReturn }) {
  const [equipmentId, setEquipmentId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!equipmentId || !staffId) {
      setError("กรุณาเลือกอุปกรณ์และผู้เบิก");
      return;
    }
    onGrant({ equipmentId, staffId, expectedReturnDate, remarks });
    setEquipmentId("");
    setStaffId("");
    setExpectedReturnDate("");
    setRemarks("");
    setError("");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold" style={{ color: COLORS.ink }}>เบิก-คืนอุปกรณ์</h1>
        <p className="text-sm" style={{ color: COLORS.textMuted }}>มอบอุปกรณ์ให้บุคลากรและติดตามการรับคืน</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${COLORS.border}` }}>
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: COLORS.ink }}>
            <ArrowLeftRight size={16} style={{ color: COLORS.amberDeep }} /> เบิกอุปกรณ์ให้บุคลากร
          </h2>
          {availableEquipment.length === 0 || activeStaff.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: COLORS.textMuted }}>
              {availableEquipment.length === 0 ? "ไม่มีอุปกรณ์ที่พร้อมให้เบิกในขณะนี้" : "ยังไม่มีบุคลากรที่ใช้งานอยู่ในระบบ"}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && <div className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: COLORS.dangerBg, color: COLORS.danger }}>{error}</div>}
              <div>
                <FieldLabel required>เลือกอุปกรณ์</FieldLabel>
                <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
                  <option value="">-- เลือกอุปกรณ์ --</option>
                  {availableEquipment.map((e) => (
                    <option key={e.id} value={e.id}>{e.asset_code} · {e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel required>เลือกผู้เบิก</FieldLabel>
                <select value={staffId} onChange={(e) => setStaffId(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
                  <option value="">-- เลือกบุคลากร --</option>
                  {activeStaff.map((s) => (
                    <option key={s.id} value={s.id}>{s.employee_code} · {s.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>วันที่คาดว่าจะคืน</FieldLabel>
                <input type="date" value={expectedReturnDate} onChange={(e) => setExpectedReturnDate(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <FieldLabel>หมายเหตุ</FieldLabel>
                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} placeholder="เช่น ใช้สำหรับงานประชุม" className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
              </div>
              <PrimaryButton type="submit">ยืนยันการเบิก</PrimaryButton>
            </form>
          )}
        </div>

        <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${COLORS.border}` }}>
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: COLORS.ink }}>
            <RotateCcw size={16} style={{ color: COLORS.inUse }} /> อุปกรณ์ที่กำลังถูกเบิกใช้งาน
          </h2>
          {inUseEquipment.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: COLORS.textMuted }}>ไม่มีอุปกรณ์ที่อยู่ระหว่างการใช้งาน</p>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[420px] overflow-y-auto pr-1">
              {inUseEquipment.map((e) => {
                const holder = e.current_staff_id ? staffById[e.current_staff_id] : null;
                return (
                  <div key={e.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: COLORS.paper }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: COLORS.ink }}>{e.name}</p>
                      <p className="text-xs" style={{ color: COLORS.textMuted }}>ผู้ถือครอง: {holder ? holder.full_name : "-"}</p>
                    </div>
                    <GhostButton onClick={() => onReturn(e)}><RotateCcw size={13} /> รับคืน</GhostButton>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GrantModal({ preset, availableEquipment, activeStaff, onClose, onSubmit }) {
  const [equipmentId, setEquipmentId] = useState(preset.equipmentId || "");
  const [staffId, setStaffId] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!equipmentId || !staffId) {
      setError("กรุณาเลือกอุปกรณ์และผู้เบิก");
      return;
    }
    onSubmit({ equipmentId, staffId, expectedReturnDate, remarks });
  }

  return (
    <Modal title="เบิกอุปกรณ์ให้บุคลากร" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <div className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: COLORS.dangerBg, color: COLORS.danger }}>{error}</div>}
        {activeStaff.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: COLORS.textMuted }}>ยังไม่มีบุคลากรที่ใช้งานอยู่ กรุณาเพิ่มบุคลากรก่อน</p>
        ) : (
          <>
            <div>
              <FieldLabel required>เลือกอุปกรณ์</FieldLabel>
              <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
                <option value="">-- เลือกอุปกรณ์ --</option>
                {availableEquipment.map((e) => (
                  <option key={e.id} value={e.id}>{e.asset_code} · {e.name}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel required>เลือกผู้เบิก</FieldLabel>
              <select value={staffId} onChange={(e) => setStaffId(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
                <option value="">-- เลือกบุคลากร --</option>
                {activeStaff.map((s) => (
                  <option key={s.id} value={s.id}>{s.employee_code} · {s.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>วันที่คาดว่าจะคืน</FieldLabel>
              <input type="date" value={expectedReturnDate} onChange={(e) => setExpectedReturnDate(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <FieldLabel>หมายเหตุ</FieldLabel>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
            </div>
          </>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <GhostButton onClick={onClose}>ยกเลิก</GhostButton>
          {activeStaff.length > 0 && <PrimaryButton type="submit">ยืนยันการเบิก</PrimaryButton>}
        </div>
      </form>
    </Modal>
  );
}

function ReturnModal({ equipment, staffById, onClose, onSubmit }) {
  const [remarks, setRemarks] = useState("");
  const holder = equipment.current_staff_id ? staffById[equipment.current_staff_id] : null;

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(remarks);
  }

  return (
    <Modal title="รับคืนอุปกรณ์" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="rounded-xl p-3" style={{ background: COLORS.paper }}>
          <p className="text-sm font-semibold" style={{ color: COLORS.ink }}>{equipment.asset_code} · {equipment.name}</p>
          <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>ผู้ถือครองปัจจุบัน: {holder ? holder.full_name : "-"}</p>
        </div>
        <div>
          <FieldLabel>สภาพอุปกรณ์ / หมายเหตุการคืน</FieldLabel>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} placeholder="เช่น อุปกรณ์อยู่ในสภาพปกติ" className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <GhostButton onClick={onClose}>ยกเลิก</GhostButton>
          <PrimaryButton type="submit">ยืนยันรับคืน</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

function MaintenanceModal({ equipment, action, onClose, onSubmit }) {
  const [remarks, setRemarks] = useState("");
  const isStart = action === "start";

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(remarks);
  }

  return (
    <Modal title={isStart ? "ส่งอุปกรณ์ซ่อมบำรุง" : "แจ้งซ่อมบำรุงเสร็จสิ้น"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="rounded-xl p-3" style={{ background: COLORS.paper }}>
          <p className="text-sm font-semibold" style={{ color: COLORS.ink }}>{equipment.asset_code} · {equipment.name}</p>
        </div>
        <div>
          <FieldLabel>{isStart ? "อาการ / สาเหตุที่ส่งซ่อม" : "รายละเอียดการซ่อม"}</FieldLabel>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} placeholder={isStart ? "เช่น จอไม่ติด" : "เช่น เปลี่ยนอะไหล่จอแสดงผล"} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <GhostButton onClick={onClose}>ยกเลิก</GhostButton>
          <PrimaryButton type="submit">{isStart ? "ยืนยันส่งซ่อม" : "ยืนยันซ่อมเสร็จ"}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

// ================= History =================
function HistoryView({ transactions, equipById, staffById }) {
  const sorted = [...transactions].sort((a, b) => new Date(b.action_date) - new Date(a.action_date));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold" style={{ color: COLORS.ink }}>ประวัติการทำรายการ</h1>
        <p className="text-sm" style={{ color: COLORS.textMuted }}>บันทึกการเบิก คืน และซ่อมบำรุงอุปกรณ์ทั้งหมด</p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl" style={{ background: "#fff", border: `1px solid ${COLORS.border}` }}>
          <EmptyState icon={Inbox} title="ยังไม่มีประวัติการทำรายการ" subtitle="เมื่อมีการเบิก คืน หรือส่งซ่อมอุปกรณ์ รายการจะแสดงที่นี่" />
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${COLORS.border}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: COLORS.paper }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: COLORS.textMuted }}>ประเภทรายการ</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: COLORS.textMuted }}>อุปกรณ์</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell" style={{ color: COLORS.textMuted }}>บุคลากร</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell" style={{ color: COLORS.textMuted }}>วันที่ทำรายการ</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell" style={{ color: COLORS.textMuted }}>กำหนด/วันคืนจริง</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: COLORS.textMuted }}>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t) => {
                const eq = equipById[t.equipment_id];
                const st = t.staff_id ? staffById[t.staff_id] : null;
                const isOpenGrant = t.action_type === "Grant" && !t.actual_return_date;
                return (
                  <tr key={t.id} style={{ borderTop: `1px solid ${COLORS.paper}` }}>
                    <td className="px-4 py-3">
                      <Badge fg={t.action_type === "Grant" ? COLORS.inUse : COLORS.maintenance} bg={t.action_type === "Grant" ? COLORS.inUseBg : COLORS.maintenanceBg}>
                        {ACTION_TH[t.action_type] || t.action_type}
                      </Badge>
                      {isOpenGrant && <span className="ml-1.5 text-[11px] font-semibold" style={{ color: COLORS.amberDeep }}>(ยังไม่คืน)</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: COLORS.ink }}>{eq ? `${eq.asset_code} · ${eq.name}` : "(ถูกลบแล้ว)"}</td>
                    <td className="px-4 py-3 hidden md:table-cell" style={{ color: COLORS.textMuted }}>{st ? st.full_name : "-"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell" style={{ color: COLORS.textMuted }}>{fmtDateTime(t.action_date)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell" style={{ color: COLORS.textMuted }}>
                      {t.action_type === "Grant" ? (t.actual_return_date ? `คืนแล้ว: ${fmtDate(t.actual_return_date)}` : `กำหนด: ${fmtDate(t.expected_return_date)}`) : "-"}
                    </td>
                    <td className="px-4 py-3" style={{ color: COLORS.textMuted }}>{t.remarks || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ================= Confirm delete =================
function ConfirmModal({ label, onClose, onConfirm }) {
  return (
    <Modal title="ยืนยันการลบ" onClose={onClose} width="max-w-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: COLORS.dangerBg }}>
            <AlertTriangle size={18} style={{ color: COLORS.danger }} />
          </div>
          <p className="text-sm" style={{ color: COLORS.text }}>
            ต้องการลบ <span className="font-semibold">{label}</span> ใช่หรือไม่? การลบนี้ไม่สามารถย้อนกลับได้
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <GhostButton onClick={onClose}>ยกเลิก</GhostButton>
          <GhostButton tone="danger" onClick={onConfirm}><Trash2 size={13} /> ยืนยันลบ</GhostButton>
        </div>
      </div>
    </Modal>
  );
}
