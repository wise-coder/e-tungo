"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import CategorySelector from "@/components/CategorySelector";
import { ListingCategory } from "@/lib/types";
import { getCategoryLabel } from "@/lib/utils";

export default function NewWantedPage() {
  const { t, user, addWantedRequest } = useApp();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<ListingCategory | null>(null);
  const [quantity, setQuantity] = useState("");
  const [district, setDistrict] = useState("");
  const [buyerPhone, setBuyerPhone] = useState(user?.phone ?? "");
  const [budget, setBudget] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [description, setDescription] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    if (!category) return;
    if (!user) {
      router.push("/signin?redirect=/wanted/new");
      return;
    }

    addWantedRequest({
      id: `w-${Date.now()}`,
      buyerId: user.id,
      buyerName: user.name,
      buyerPhone,
      buyerDistrict: district || user.district,
      category,
      title: `Looking for ${quantity ? `${quantity} ` : ""}${getCategoryLabel(category, "en").toLowerCase()}`,
      quantity: quantity || undefined,
      budget: budget || undefined,
      neededBy: neededBy || undefined,
      description: description || undefined,
      postedAt: new Date().toISOString(),
      status: "open",
    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-700 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.requestLive}</h2>
        <div className="flex flex-col gap-3 mt-8">
          <Link
            href="/wanted"
            className="w-full py-4 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl text-center"
          >
            {t.viewAllRequests}
          </Link>
          <Link href="/" className="w-full py-4 text-gray-600 font-medium text-center">
            {t.goHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="sticky top-0 md:top-16 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => (step === 0 ? router.back() : setStep(0))}
          className="text-gray-600 hover:text-brand-700"
          aria-label={t.back}
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="font-bold text-gray-900">{t.postRequest}</h2>
      </div>

      <div className="px-4 py-6">
        {step === 0 ? (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{t.whatLookingFor}</h1>
            <p className="text-sm text-gray-500 mb-6">Choose a category.</p>
            <CategorySelector
              selected={category}
              onSelect={(cat) => {
                setCategory(cat);
                setStep(1);
              }}
            />
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-6">{t.whatLookingFor}</h1>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t.quantityNeeded}
                </label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 10, 50 litres, 100 trays"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t.preferredLocation} <span className="text-red-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select district...</option>
                  {t.districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t.buyerPhone} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+250 7xx xxx xxx"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t.budget}
                </label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 500,000 RWF or Negotiable"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t.neededBy}
                </label>
                <input
                  type="date"
                  value={neededBy}
                  onChange={(e) => setNeededBy(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t.shortDescription}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any specific requirements..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="flex-1 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
              >
                {t.back}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!district || !buyerPhone.trim()}
                className="flex-1 py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl"
              >
                {t.postRequestBtn}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
