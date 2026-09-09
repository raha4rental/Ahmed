"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import type { ExpenseCategory, MaintenancePriority, PaymentMethod } from "@/lib/types";
import { TODAY } from "@/lib/format";

const field = "grid gap-1.5";
const selectCls =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AddApartmentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data, addApartment, t } = useStore();
  const [buildingId, setBuildingId] = useState(data.buildings[0]?.id ?? "");
  const [number, setNumber] = useState("");
  const [city, setCity] = useState("Cleveland");
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [base, setBase] = useState(159);
  const [weekly, setWeekly] = useState(980);
  const [monthly, setMonthly] = useState(3500);
  const [cleaningFee, setCleaningFee] = useState(95);
  const [deposit, setDeposit] = useState(300);
  const [description, setDescription] = useState("");

  function save() {
    if (!number.trim()) return;
    addApartment({
      buildingId,
      number: number.trim(),
      city,
      bedrooms,
      bathrooms,
      description: description || `Unit ${number} in ${city}.`,
      descriptionAr: description || `شقة ${number} في ${city}.`,
      photos: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
      ],
      status: "ready",
      pricing: {
        base,
        weekend: base + 25,
        weekly,
        monthly,
        seasonal: base + 40,
        corporate: Math.round(base * 0.9),
        longStay: Math.round(base * 0.78),
        cleaningFee,
        deposit,
        minStay: 2,
        discountPct: 0,
      },
    });
    toast.success(t("created"));
    onOpenChange(false);
    setNumber("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("addApartment")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={field}>
            <Label>{t("building")}</Label>
            <select className={selectCls} value={buildingId} onChange={(e) => setBuildingId(e.target.value)}>
              {data.buildings.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className={field}>
            <Label>{t("apartment")}</Label>
            <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="405" />
          </div>
          <div className={field}>
            <Label>{t("city")}</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("bedrooms")}</Label>
            <Input type="number" value={bedrooms} onChange={(e) => setBedrooms(+e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("bathrooms")}</Label>
            <Input type="number" value={bathrooms} onChange={(e) => setBathrooms(+e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("basePrice")}</Label>
            <Input type="number" value={base} onChange={(e) => setBase(+e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("weekly")}</Label>
            <Input type="number" value={weekly} onChange={(e) => setWeekly(+e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("monthly")}</Label>
            <Input type="number" value={monthly} onChange={(e) => setMonthly(+e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("cleaningFee")}</Label>
            <Input type="number" value={cleaningFee} onChange={(e) => setCleaningFee(+e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("deposit")}</Label>
            <Input type="number" value={deposit} onChange={(e) => setDeposit(+e.target.value)} />
          </div>
          <div className={`${field} sm:col-span-2`}>
            <Label>{t("description")}</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button onClick={save}>{t("saveApartment")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AddBuildingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { addBuilding, t } = useStore();
  const [name, setName] = useState("");
  const [city, setCity] = useState("Cleveland");
  const [address, setAddress] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addBuilding")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className={field}>
            <Label>{t("buildingName")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("city")}</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("address")}</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button
            onClick={() => {
              if (!name.trim()) return;
              addBuilding({ name: name.trim(), city, address });
              toast.success(t("created"));
              onOpenChange(false);
              setName("");
            }}
          >
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CheckInDialog({
  open,
  onOpenChange,
  bookingId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bookingId: string | null;
}) {
  const { data, checkIn, t } = useStore();
  const bk = data.bookings.find((b) => b.id === bookingId);
  const guest = data.guests.find((g) => g.id === bk?.guestId);
  const apt = data.apartments.find((a) => a.id === bk?.apartmentId);
  const building = data.buildings.find((b) => b.id === apt?.buildingId);
  if (!bk || !guest || !apt) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("checkIn")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 rounded-xl bg-muted/60 p-4 text-sm">
          <Row k={t("guest")} v={guest.name} />
          <Row k={t("apartment")} v={`${building?.name} ${apt.number}`} />
          <Row k={t("checkIn")} v={`${bk.checkIn} – ${bk.checkInTime}`} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button
            onClick={() => {
              checkIn(bk.id);
              toast.success(`🟢 ${t("checkedIn")}`);
              onOpenChange(false);
            }}
          >
            🟢 {t("checkedIn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

export function CheckOutDialog({
  open,
  onOpenChange,
  bookingId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bookingId: string | null;
}) {
  const { data, checkOut, t } = useStore();
  const bk = data.bookings.find((b) => b.id === bookingId);
  const [time, setTime] = useState("11:00 AM");
  const [condition, setCondition] = useState("Good");
  const [hasDamage, setHasDamage] = useState(false);
  const [hasMissing, setHasMissing] = useState(false);
  const [extra, setExtra] = useState(0);
  const [notes, setNotes] = useState("");
  if (!bk) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("checkOut")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className={field}>
            <Label>{t("checkoutTime")}</Label>
            <Input value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("condition")}</Label>
            <Input value={condition} onChange={(e) => setCondition(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={hasDamage} onChange={(e) => setHasDamage(e.target.checked)} />
            {t("damage")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={hasMissing} onChange={(e) => setHasMissing(e.target.checked)} />
            {t("missingItems")}
          </label>
          <div className={field}>
            <Label>{t("extraCharge")}</Label>
            <Input type="number" value={extra} onChange={(e) => setExtra(+e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("notes")}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button
            onClick={() => {
              checkOut(bk.id, {
                checkoutTime: time,
                apartmentCondition: condition,
                hasDamage,
                hasMissing,
                extraCharge: extra,
                photos: [],
                cleaningRequired: true,
                notes,
              });
              toast.success(`🟡 ${t("cleaningRequired")}`);
              onOpenChange(false);
            }}
          >
            {t("checkOut")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BookingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data, addBooking, addGuest, t, user } = useStore();
  const [guestId, setGuestId] = useState(data.guests[0]?.id ?? "");
  const [newName, setNewName] = useState("");
  const [apartmentId, setApartmentId] = useState(
    data.apartments.find((a) => a.status === "ready")?.id ?? data.apartments[0]?.id ?? ""
  );
  const [checkIn, setCheckIn] = useState(TODAY);
  const [checkOut, setCheckOut] = useState("2026-09-12");
  const [time] = useState("4:00 PM");
  const [people, setPeople] = useState(2);
  const [total, setTotal] = useState(800);
  const [paid, setPaid] = useState(400);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [notes] = useState("");

  if (user && !can.viewBookings(user.role)) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("createBooking")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={`${field} sm:col-span-2`}>
            <Label>{t("guest")}</Label>
            <select className={selectCls} value={guestId} onChange={(e) => setGuestId(e.target.value)}>
              {data.guests.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <Input className="mt-2" placeholder={t("newGuest")} value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div className={`${field} sm:col-span-2`}>
            <Label>{t("apartment")}</Label>
            <select className={selectCls} value={apartmentId} onChange={(e) => setApartmentId(e.target.value)}>
              {data.apartments.map((a) => {
                const b = data.buildings.find((x) => x.id === a.buildingId);
                return (
                  <option key={a.id} value={a.id}>{b?.name} {a.number}</option>
                );
              })}
            </select>
          </div>
          <div className={field}>
            <Label>{t("checkIn")}</Label>
            <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("checkOut")}</Label>
            <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("people")}</Label>
            <Input type="number" value={people} onChange={(e) => setPeople(+e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("bookingTotal")}</Label>
            <Input type="number" value={total} onChange={(e) => setTotal(+e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("paid")}</Label>
            <Input type="number" value={paid} onChange={(e) => setPaid(+e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("payment")}</Label>
            <select className={selectCls} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              <option value="cash">{t("cash")}</option>
              <option value="card">{t("card")}</option>
              <option value="transfer">{t("transfer")}</option>
              <option value="corporate">{t("corporate")}</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button
            onClick={() => {
              let gid = guestId;
              if (newName.trim()) {
                gid = addGuest({ name: newName.trim(), phone: "", email: "", notes: "" });
              }
              addBooking({
                guestId: gid,
                apartmentId,
                checkIn,
                checkOut,
                checkInTime: time,
                guestsCount: people,
                totalAmount: total,
                paidAmount: paid,
                paymentMethod: method,
                status: "booked",
                notes,
              });
              toast.success(t("created"));
              onOpenChange(false);
            }}
          >
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MaintenanceDialog({
  open,
  onOpenChange,
  apartmentId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  apartmentId?: string;
}) {
  const { data, addMaintenance, t } = useStore();
  const [apt, setApt] = useState(apartmentId ?? data.apartments[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<MaintenancePriority>("normal");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("newRequest")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className={field}>
            <Label>{t("apartment")}</Label>
            <select className={selectCls} value={apt} onChange={(e) => setApt(e.target.value)}>
              {data.apartments.map((a) => {
                const b = data.buildings.find((x) => x.id === a.buildingId);
                return <option key={a.id} value={a.id}>{b?.name} {a.number}</option>;
              })}
            </select>
          </div>
          <div className={field}>
            <Label>{t("problem")}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="AC not cooling" />
          </div>
          <div className={field}>
            <Label>{t("description")}</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className={field}>
            <Label>{t("priority")}</Label>
            <select className={selectCls} value={priority} onChange={(e) => setPriority(e.target.value as MaintenancePriority)}>
              <option value="urgent">🔴 {t("urgent")}</option>
              <option value="normal">🟡 {t("normal")}</option>
              <option value="low">⚪ {t("low")}</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button
            onClick={() => {
              if (!title.trim()) return;
              addMaintenance({
                apartmentId: apt,
                title: title.trim(),
                description,
                photos: [],
                video: null,
                priority,
                status: "new",
                assigneeId: null,
                cost: 0,
                invoice: null,
                date: TODAY,
              });
              toast.success(t("created"));
              onOpenChange(false);
              setTitle("");
            }}
          >
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ExpenseDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data, addExpense, t } = useStore();
  const [buildingId, setBuildingId] = useState(data.buildings[0]?.id ?? "");
  const [apartmentId, setApartmentId] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("rent");
  const [amount, setAmount] = useState(50);
  const [dueDate, setDueDate] = useState(TODAY);
  const [paid, setPaid] = useState(false);
  const [description, setDescription] = useState("");
  const units = data.apartments.filter((a) => a.buildingId === buildingId);
  const apt = data.apartments.find((a) => a.id === apartmentId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addExpense")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className={field}>
            <Label>{t("category")}</Label>
            <select className={selectCls} value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
              <option value="rent">🏠 {t("rent")}</option>
              <option value="electricity">⚡ {t("electricity")}</option>
              <option value="emergency">🚨 {t("emergency")}</option>
              <option value="supplies">🧴 {t("supplies")}</option>
              <option value="internet">🌐 {t("internet")}</option>
              <option value="water">💧 {t("water")}</option>
              <option value="maintenance">🔧 {t("maintenance")}</option>
              <option value="cleaning">🧹 {t("cleaning")}</option>
              <option value="furniture">🛋️ {t("furniture")}</option>
              <option value="repairs">{t("repairs")}</option>
              <option value="other">{t("other")}</option>
            </select>
          </div>
          <div className={field}>
            <Label>{t("building")}</Label>
            <select
              className={selectCls}
              value={buildingId}
              onChange={(e) => {
                setBuildingId(e.target.value);
                setApartmentId("");
              }}
            >
              {data.buildings.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          {category !== "rent" ? (
            <div className={field}>
              <Label>{t("apartment")}</Label>
              <select className={selectCls} value={apartmentId} onChange={(e) => setApartmentId(e.target.value)}>
                <option value="">{t("wholeBuilding")}</option>
                {units.map((a) => (
                  <option key={a.id} value={a.id}>{a.number}</option>
                ))}
              </select>
            </div>
          ) : null}
          <div className={field}>
            <Label>{t("amount")}</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("dueDate")}</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("description")}</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
            {t("billPaid")}
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button
            onClick={() => {
              if (!buildingId || !amount) return;
              addExpense({
                buildingId,
                apartmentId: category === "rent" ? "" : apartmentId || apt?.id || "",
                category,
                amount,
                date: TODAY,
                dueDate,
                paid,
                description,
                receipt: null,
              });
              toast.success(t("created"));
              onOpenChange(false);
            }}
          >
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function GuestDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { addGuest, t } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addGuest")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className={field}>
            <Label>{t("name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("phone")}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("email")}</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className={field}>
            <Label>{t("notes")}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button
            onClick={() => {
              if (!name.trim()) return;
              addGuest({ name: name.trim(), phone, email, notes });
              toast.success(t("created"));
              onOpenChange(false);
              setName("");
            }}
          >
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
