import { motion } from 'framer-motion';
import { FileText, Download, FileCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { Section, SectionHeader } from '@/components/layout/Section';
import { cn } from '@/lib/utils';

const QuestionnairesSection = () => {
  const { language, t, isRTL } = useLanguage();

  const questionnaires = [
    {
      icon: FileText,
      title: t('questionnaires.conners_parents'),
      description: t('questionnaires.conners_parents_desc'),
      id: 'conners-parents',
      pdf: '/docs/conners_parents.pdf',
      doc: '/docs/conners_parents.doc',
    },
    {
      icon: FileText,
      title: t('questionnaires.conners_teachers'),
      description: t('questionnaires.conners_teachers_desc'),
      id: 'conners-teachers',
      pdf: '/docs/conners_teachers.pdf',
      doc: '/docs/conners_teachers.doc',
    },
    {
      icon: FileCheck,
      title: t('questionnaires.asrs_adults'),
      description: t('questionnaires.asrs_adults_desc'),
      id: 'asrs-adults',
      pdf: '/docs/asrs_adults.pdf',
      doc: '/docs/asrs_adults.doc',
    },
    {
      icon: FileCheck,
      title: t('questionnaires.daily_functioning'),
      description: t('questionnaires.daily_functioning_desc'),
      id: 'daily-functioning',
      pdf: '/docs/daily_functioning.pdf',
      doc: '/docs/daily_functioning.doc',
    },
  ];

  return (
    <Section
      id="questionnaires"
      background="default"
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-labelledby="questionnaires-heading"
    >
      <SectionHeader
        title={t('questionnaires.title')}
        subtitle={t('questionnaires.subtitle')}
        titleId="questionnaires-heading"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {questionnaires.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="h-full shadow-md border-0" data-testid={`card-questionnaire-${item.id}`}>
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0"
                    aria-hidden="true"
                  >
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
                <div className={cn("flex flex-wrap gap-3", isRTL ? "justify-end" : "justify-start")}>
                  <a
                    href={item.pdf}
                    download
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium",
                      "bg-secondary text-secondary-foreground",
                      "hover-elevate active-elevate-2 transition-colors"
                    )}
                    data-testid={`download-pdf-${item.id}`}
                  >
                    <Download className="w-4 h-4" />
                    {t('questionnaires.download_pdf')}
                  </a>
                  <a
                    href={item.doc}
                    download
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium",
                      "bg-secondary text-secondary-foreground",
                      "hover-elevate active-elevate-2 transition-colors"
                    )}
                    data-testid={`download-doc-${item.id}`}
                  >
                    <Download className="w-4 h-4" />
                    {t('questionnaires.download_doc')}
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-center text-muted-foreground text-sm sm:text-base mt-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
        data-testid="text-questionnaires-note"
      >
        {t('questionnaires.note')}
      </motion.p>
    </Section>
  );
};

export default QuestionnairesSection;
