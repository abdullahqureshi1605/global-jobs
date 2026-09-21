export default function ContactPage() {
  return (
    <section className="horizon-container py-12">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <p className="font-bold text-[#d9a62e]">Get in touch</p>

          <h1 className="mt-2 text-4xl font-bold text-[#07152d]">
            Contact Horizon Jobs
          </h1>

          <p className="mt-5 max-w-lg leading-7 text-gray-500">
            Questions about a listing, partnership, employer account, or the
            Horizon Jobs platform? Send us a message.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <p className="font-bold">Email</p>
              <p className="text-gray-500">support@horizonjobs.online</p>
            </div>

            <div>
              <p className="font-bold">Platform</p>
              <p className="text-gray-500">Horizon Jobs</p>
            </div>
          </div>
        </div>

        <form className="horizon-card p-7">
          <div className="grid gap-4 md:grid-cols-2">
            <input className="horizon-input" placeholder="First name" />
            <input className="horizon-input" placeholder="Last name" />
          </div>

          <input
            className="horizon-input mt-4"
            type="email"
            placeholder="Email"
          />

          <select className="horizon-input mt-4">
            <option>General question</option>
            <option>Job report</option>
            <option>Employer support</option>
            <option>Partnership</option>
          </select>

          <textarea
            className="mt-4 min-h-36 w-full rounded border border-[#cfd7e3] p-3 outline-none"
            placeholder="How can we help?"
          />

          <button
            type="button"
            className="horizon-button horizon-button-gold mt-4"
          >
            Send message
          </button>
        </form>
      </div>
    </section>
  );
}
