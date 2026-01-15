
import React, { useState } from 'react';
import type { Lead } from '../types';
import { supabase } from '../lib/supabase';

interface ContactFormProps {
    content: {
        heading: string;
        subHeading: string;
        form: {
            fullNameLabel: string;
            fullNamePlaceholder: string;
            companyLabel: string;
            companyPlaceholder: string;
            emailLabel: string;
            emailPlaceholder: string;
            phoneLabel: string;
            phonePlaceholder: string;
            messageLabel: string;
            messagePlaceholder: string;
            submitButton: string;
            errors: {
                nameRequired: string;
                emailRequired: string;
                emailInvalid: string;
                phoneInvalid: string;
            },
            successMessage: string;
        };
    };
}

const ContactForm: React.FC<ContactFormProps> = ({ content }) => {
    const { form } = content;
    const [formData, setFormData] = useState<Lead>({
        fullName: '',
        company: '',
        email: '',
        phone: '',
        message: '',
    });
    const [errors, setErrors] = useState<{ [key in keyof Lead]?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const validate = (): boolean => {
        const newErrors: { [key in keyof Lead]?: string } = {};
        if (!formData.fullName.trim()) {
            newErrors.fullName = form.errors.nameRequired;
        }
        if (!formData.email.trim()) {
            newErrors.email = form.errors.emailRequired;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = form.errors.emailInvalid;
        }
        if (formData.phone && !/^[0-9()+\-.\s]*$/.test(formData.phone)) {
            newErrors.phone = form.errors.phoneInvalid;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Salvar no Supabase
            const { error: supabaseError } = await supabase.from('leads').insert([
                {
                    full_name: formData.fullName,
                    company: formData.company,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                }
            ]);

            if (supabaseError) {
                console.error('Supabase error:', supabaseError);
                setSubmitError('Erro ao enviar. Por favor, tente novamente.');
                setIsSubmitting(false);
                return;
            }

            // Enviar e-mail via API
            const apiUrl = import.meta.env.VITE_API_URL || 'https://oxservices.org/api';
            const response = await fetch(`${apiUrl}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    company: formData.company,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                }),
            });

            if (!response.ok) {
                console.warn('Email API error:', await response.text());
                // Não falhar se o e-mail não enviar, dados já foram salvos
            }

            setIsSubmitting(false);
            setIsSubmitted(true);
        } catch (err) {
            console.error('Submit error:', err);
            setSubmitError('Erro ao enviar. Por favor, tente novamente.');
            setIsSubmitting(false);
        }
    };


    if (isSubmitted) {
        return (
            <div className="w-full flex justify-center py-20 px-4 md:px-10 bg-[#0B242A]">
                <div className="w-full max-w-2xl text-center p-12 bg-white dark:bg-[#1a2629] rounded-xl shadow-lg">
                    <span className="material-symbols-outlined text-5xl text-green-500 notranslate" translate="no">check_circle</span>
                    <h3 className="text-2xl font-bold mt-4 text-primary dark:text-white">{form.successMessage.split('!')[0]}!</h3>
                    <p className="text-primary/70 dark:text-white/70 mt-2">{form.successMessage.split('!')[1]}</p>
                </div>
            </div>
        )
    }

    return (
        <section className="w-full flex justify-center py-20 px-4 md:px-10 bg-[#0B242A]">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-white">{content.heading}</h2>
                    <p className="mt-3 text-lg text-white/70 max-w-xl mx-auto font-body">{content.subHeading}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-[#1a2629] p-8 rounded-xl shadow-lg" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-primary/80 dark:text-white/80">{form.fullNameLabel}</label>
                            <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} placeholder={form.fullNamePlaceholder} aria-label={form.fullNameLabel} required aria-invalid={!!errors.fullName} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-primary dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                        </div>
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-primary/80 dark:text-white/80">{form.companyLabel}</label>
                            <input type="text" name="company" id="company" value={formData.company} onChange={handleChange} placeholder={form.companyPlaceholder} aria-label={form.companyLabel} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-primary dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-primary/80 dark:text-white/80">{form.emailLabel}</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} placeholder={form.emailPlaceholder} aria-label={form.emailLabel} required aria-invalid={!!errors.email} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-primary dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-primary/80 dark:text-white/80">{form.phoneLabel}</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} placeholder={form.phonePlaceholder} aria-label={form.phoneLabel} aria-invalid={!!errors.phone} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-primary dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-primary/80 dark:text-white/80">{form.messageLabel}</label>
                        <textarea name="message" id="message" value={formData.message} onChange={handleChange} rows={4} placeholder={form.messagePlaceholder} aria-label={form.messageLabel} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark text-primary dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"></textarea>
                    </div>
                    <div>
                        {submitError && <p className="mb-3 text-sm text-red-500 text-center">{submitError}</p>}
                        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
                            {isSubmitting ? 'Enviando...' : form.submitButton}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default ContactForm;
