"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, MapPin } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ListingCategory } from "@/lib/types";
import CategorySelector from "@/components/CategorySelector";
import ImageUploader from "@/components/ImageUploader";
import CategoryIcon from "@/components/CategoryIcon";
import StepIndicator from "@/components/StepIndicator";
import { getCategoryLabel, formatPrice } from "@/lib/utils";
import Link from "next/link";

const TOTAL_STEPS = 4; // category, photos, details, preview

interface FormData {
  category: ListingCategory | null;
  images: string[];
  title: string;
  price: string;
  quantity: string;
  district: string;
  sector: string;
  breed: string;
  sex: "male" | "female" | "";
  age: string;
  weight: string;
  description: string;
  vaccinationStatus: string;
  milkProduction: string;
  chickenType: string;
  litresAvailable: string;
  milkAvailability: "daily" | "one-time" | "";
  traysAvailable: string;
}

const defaultForm: FormData = {
  category: null,
  images: [],
  title: "",
  price: "",
  quantity: "",
  district: "",
  sector: "",
  breed: "",
  sex: "",
  age: "",
  weight: "",
  description: "",
  vaccinationStatus: "",
  milkProduction: "",
  chickenType: "",
  litresAvailable: "",
  milkAvailability: "",
  traysAvailable: "",
};

export default function SellPage() {
  const { t, lang, user, addListing } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [publishedId, setPublishedId] = useState<string | null>(null);

  const set = (key: keyof FormData, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const canProceed = () => {
    if (step === 0) return !!form.category;
    if (step === 1) return form.images.length === 1;
    if (step === 2) return !!form.price && !!form.district;
    return true;
  };

  const handlePublish = async () => {
    if (!form.category) return;
    // Require sign-in
    if (!user) {
      router.push("/signin?redirect=/sell");
      return;
    }

    const id = `new-${Date.now()}`;
    const catLabel = getCategoryLabel(form.category, lang);

    const created = await addListing({
      id,
      sellerId: user.id,
      sellerName: user.name,
      sellerEmail: user.email,
      sellerPhone: user.phone ?? "",
      sellerPhoneVerified: Boolean(user.phone && user.phoneVerified),
      sellerDistrict: user.district,
      category: form.category,
      title: form.title || catLabel,
      price: parseInt(form.price) || 0,
      priceUnit:
        form.category === "milk"
          ? t.perLitre
          : form.category === "eggs"
          ? t.perTray
          : form.quantity && parseInt(form.quantity) > 1
          ? t.each
          : undefined,
      quantity: form.quantity ? parseInt(form.quantity) : undefined,
      district: form.district,
      sector: form.sector || undefined,
      images: form.images,
      status: "active",
      views: 0,
      postedAt: new Date().toISOString(),
      breed: form.breed || undefined,
      sex: (form.sex as "male" | "female") || undefined,
      age: form.age || undefined,
      weight: form.weight || undefined,
      milkProduction: form.milkProduction || undefined,
      vaccinationStatus: form.vaccinationStatus || undefined,
      chickenType: (form.chickenType as "local" | "broiler" | "layer" | "chicks") || undefined,
      litresAvailable: form.litresAvailable ? parseInt(form.litresAvailable) : undefined,
      milkAvailability: (form.milkAvailability as "daily" | "one-time") || undefined,
      traysAvailable: form.traysAvailable ? parseInt(form.traysAvailable) : undefined,
      description: form.description || undefined,
    });

    if (created) setPublishedId(created.id);
  };

  // Success screen
  if (publishedId) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-700 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.listingLive}</h2>
        <p className="text-gray-500 text-sm mb-8">
          {form.title || (form.category ? getCategoryLabel(form.category, lang) : "")}
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={`/listing/${publishedId}`}
            className="w-full py-4 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl text-center transition-colors"
          >
            {t.viewListing}
          </Link>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ url: `${window.location.origin}/listing/${publishedId}` });
              }
            }}
            className="w-full py-4 border-2 border-brand-700 text-brand-700 font-semibold rounded-xl transition-colors hover:bg-gray-50"
          >
            {t.shareBtn}
          </button>
          <Link
            href="/"
            className="w-full py-4 text-gray-600 font-medium text-center hover:text-gray-900 transition-colors"
          >
            {t.goHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 md:top-16 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => (step === 0 ? router.back() : setStep(step - 1))}
          className="text-gray-600 hover:text-brand-700"
          aria-label={t.back}
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1">
          <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Step 0 — Category */}
        {step === 0 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{t.whatAreSelling}</h1>
            <p className="text-gray-500 text-sm mb-6">Choose a category to continue.</p>
            <CategorySelector
              selected={form.category}
              onSelect={(cat) => {
                setForm((prev) => ({ ...prev, category: cat }));
              }}
            />
          </div>
        )}

        {/* Step 1 — Photos */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{t.addPhotos}</h1>
            <p className="text-gray-500 text-sm mb-6">
              Add one clear photo. It will be compressed before saving.
            </p>
            <ImageUploader
              images={form.images}
              onImagesChange={(imgs) => setForm((prev) => ({ ...prev, images: imgs }))}
            />
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 2 && form.category && (
          <DetailsStep form={form} set={set} category={form.category} />
        )}

        {/* Step 3 — Preview */}
        {step === 3 && form.category && (
          <PreviewStep form={form} category={form.category} />
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              {t.back}
            </button>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-colors"
            >
              {t.next}
            </button>
          ) : (
            <button
              onClick={handlePublish}
              className="flex-1 py-4 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl transition-colors"
            >
              {t.publish}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Details step ──────────────────────────────────────────────────────────────
function DetailsStep({
  form,
  set,
  category,
}: {
  form: FormData;
  set: (k: keyof FormData, v: string) => void;
  category: ListingCategory;
}) {
  const { t, lang } = useApp();
  const isMilk = category === "milk";
  const isEggs = category === "eggs";
  const isChicken = category === "chickens";
  const isAnimal = ["cattle", "goats", "sheep", "pigs", "rabbits"].includes(category);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t.basicDetails}</h1>
      <p className="text-gray-500 text-sm mb-6 inline-flex items-center gap-2">
        <CategoryIcon category={category} size={18} />
        {getCategoryLabel(category, lang)}
      </p>

      <div className="space-y-4">
        {/* Title */}
        <Field label={`${getCategoryLabel(category, lang)} — ${lang === "rw" ? "Izina (si ngombwa)" : "Title (optional)"}`}>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder={getCategoryLabel(category, lang)}
            className="input-field"
          />
        </Field>

        {/* Price */}
        <Field label={t.priceLabel} required>
          <input
            type="number"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="e.g. 150000"
            inputMode="numeric"
            className="input-field"
          />
        </Field>

        {/* Milk-specific */}
        {isMilk && (
          <>
            <Field label={t.litresAvailable}>
              <input
                type="number"
                value={form.litresAvailable}
                onChange={(e) => set("litresAvailable", e.target.value)}
                placeholder="e.g. 50"
                inputMode="numeric"
                className="input-field"
              />
            </Field>
            <Field label={lang === "rw" ? "Uboneka ryari" : "Availability"}>
              <select
                value={form.milkAvailability}
                onChange={(e) => set("milkAvailability", e.target.value)}
                className="input-field"
              >
                <option value="">Select...</option>
                <option value="daily">{t.dailyAvailability}</option>
                <option value="one-time">{t.oneTime}</option>
              </select>
            </Field>
          </>
        )}

        {/* Eggs-specific */}
        {isEggs && (
          <Field label={t.traysAvailable}>
            <input
              type="number"
              value={form.traysAvailable}
              onChange={(e) => set("traysAvailable", e.target.value)}
              placeholder="e.g. 100"
              inputMode="numeric"
              className="input-field"
            />
          </Field>
        )}

        {/* Chicken-specific */}
        {isChicken && (
          <>
            <Field label={t.quantityLabel}>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                placeholder="e.g. 20"
                inputMode="numeric"
                className="input-field"
              />
            </Field>
            <Field label={t.chickenType}>
              <select
                value={form.chickenType}
                onChange={(e) => set("chickenType", e.target.value)}
                className="input-field"
              >
                <option value="">Select...</option>
                <option value="local">{t.local}</option>
                <option value="broiler">{t.broiler}</option>
                <option value="layer">{t.layer}</option>
                <option value="chicks">{t.chicks}</option>
              </select>
            </Field>
            <Field label={t.ageLabel}>
              <input
                type="text"
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
                placeholder="e.g. 6 months"
                className="input-field"
              />
            </Field>
          </>
        )}

        {/* Animal fields */}
        {isAnimal && (
          <>
            <Field label={t.quantityLabel}>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                placeholder="e.g. 1"
                inputMode="numeric"
                className="input-field"
              />
            </Field>
            <Field label={t.breedLabel}>
              <input
                type="text"
                value={form.breed}
                onChange={(e) => set("breed", e.target.value)}
                placeholder={lang === "rw" ? "Nk'Ankole, Friesian..." : "e.g. Friesian, Ankole..."}
                className="input-field"
              />
            </Field>
            <Field label={lang === "rw" ? "Igitsina" : "Sex"}>
              <div className="grid grid-cols-2 gap-2">
                {(["male", "female"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("sex", s)}
                  className={`py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                    form.sex === s
                        ? "border-brand-700 bg-brand-700 text-white"
                        : "border-gray-200 text-gray-600 hover:border-brand-700"
                  }`}
                  >
                    {s === "male" ? t.male : t.female}
                  </button>
                ))}
              </div>
            </Field>
            <Field label={t.ageLabel}>
              <input
                type="text"
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
                placeholder="e.g. 2 years"
                className="input-field"
              />
            </Field>
            <Field label={t.weightLabel}>
              <input
                type="text"
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
                placeholder="e.g. 200 kg"
                className="input-field"
              />
            </Field>
            {category === "cattle" && (
              <Field label={t.milkLabel}>
                <input
                  type="text"
                  value={form.milkProduction}
                  onChange={(e) => set("milkProduction", e.target.value)}
                  placeholder="e.g. 15 litres/day"
                  className="input-field"
                />
              </Field>
            )}
            <Field label={t.vaccinationLabel}>
              <input
                type="text"
                value={form.vaccinationStatus}
                onChange={(e) => set("vaccinationStatus", e.target.value)}
                placeholder="e.g. Up to date"
                className="input-field"
              />
            </Field>
          </>
        )}

        {/* Location — required */}
        <Field label={t.districtLabel} required>
          <select
            value={form.district}
            onChange={(e) => set("district", e.target.value)}
            className="input-field"
          >
            <option value="">Select district...</option>
            {t.districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Field>

        <Field label={t.sectorLabel}>
          <input
            type="text"
            value={form.sector}
            onChange={(e) => set("sector", e.target.value)}
            placeholder="e.g. Muhoza"
            className="input-field"
          />
        </Field>

        {/* Description */}
        <Field label={t.descriptionLabel}>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Short description..."
            rows={3}
            className="input-field resize-none"
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Preview step ──────────────────────────────────────────────────────────────
function PreviewStep({ form, category }: { form: FormData; category: ListingCategory }) {
  const { t, lang, user } = useApp();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t.preview}</h1>
      <p className="text-gray-500 text-sm mb-6">Review before publishing.</p>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Image preview */}
        <div className="h-52 bg-gray-100 flex items-center justify-center">
          {form.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.images[0]}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <CategoryIcon category={category} size={64} />
          )}
        </div>
        <div className="p-4 space-y-2">
          <p className="font-bold text-lg text-gray-900">
            {form.title || getCategoryLabel(category, lang)}
          </p>
          <p className="text-xl font-bold text-brand-700">
            {form.price ? formatPrice(parseInt(form.price)) : "—"}
          </p>
          {form.district && (
            <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14} className="text-gray-400" /> {form.district}{form.sector ? `, ${form.sector}` : ""}</p>
          )}
          {user?.phone ? <p className="text-sm text-gray-600">Buyers can call or WhatsApp you at <strong>{user.phone}</strong>.</p>
            : <p className="text-sm text-red-600">Add your mobile number in <a className="font-semibold underline" href="/account/profile">your profile</a> before publishing.</p>}
          {form.description && (
            <p className="text-sm text-gray-600 mt-2">{form.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
