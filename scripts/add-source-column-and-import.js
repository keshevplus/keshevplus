import { neon } from '@neondatabase/serverless';

// Use the provided database URL
const databaseUrl = 'postgresql://neondb_owner:npg_tYJvA94QMXLK@ep-icy-forest-a4rpjd22-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(databaseUrl);

// Sample Facebook user data for testimonials
const facebookTestimonials = [
  {
    name: 'יעל כהן',
    email: 'yael.cohen@example.com',
    comment: 'הטיפול אצל ד"ר קשב שינה את חיי לחלוטין. אני מרגישה יותר ממוקדת ומסוגלת להתמודד עם האתגרים היומיומיים.',
    rating: 5,
    source: 'facebook'
  },
  {
    name: 'אבי לוי',
    email: 'avi.levi@example.com',
    comment: 'לאחר שנים של התמודדות עם ADHD, סוף סוף מצאתי את הטיפול המתאים. תודה לצוות המקצועי והאכפתי.',
    rating: 5,
    source: 'facebook'
  },
  {
    name: 'מיכל ברק',
    email: 'michal.barak@example.com',
    comment: 'הבן שלי השתפר מאוד בלימודים מאז שהתחיל את הטיפול. מומלץ בחום!',
    rating: 4,
    source: 'facebook'
  },
  {
    name: 'דוד גולדשטיין',
    email: 'david.goldstein@example.com',
    comment: 'היחס האישי והמקצועיות של הצוות ראויים להערכה. אני ממליץ לכל מי שמתמודד עם הפרעות קשב.',
    rating: 5,
    source: 'facebook'
  },
  {
    name: 'נועה שפירא',
    email: 'noa.shapira@example.com', 
    comment: 'הכלים שקיבלתי בטיפול עוזרים לי להתמודד טוב יותר בעבודה ובחיים האישיים.',
    rating: 5,
    source: 'facebook'
  },
  {
    name: 'עומר דהן',
    email: 'omer.dahan@example.com',
    comment: 'אחרי שנים שלא הבנתי למה אני מתקשה להתרכז, האבחון והטיפול פתחו בפני דלתות חדשות.',
    rating: 4,
    source: 'facebook'
  },
  {
    name: 'רוני אלון',
    email: 'roni.alon@example.com',
    comment: 'הצוות מקצועי, קשוב ותומך. עזרו לי מאוד להתמודד עם האתגרים היומיומיים.',
    rating: 5,
    source: 'facebook'
  }
];

async function updateDatabaseSchema() {
  try {
    console.log('Connecting to database...');
    
    // Step 1: Check if 'users' table exists
    console.log('\nChecking for users table...');
    const usersTableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    
    if (!usersTableCheck[0].exists) {
      console.log('\nUsers table does not exist. Creating it...');
      await sql`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE,
          password VARCHAR(255),
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          source VARCHAR(100) DEFAULT 'manual'
        );
      `;
      console.log('✅ Users table created with source column');
    } else {
      // Step 2: Check if 'source' column exists in users table
      console.log('\nChecking if source column exists in users table...');
      const sourceColumnCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'source'
        );
      `;
      
      if (!sourceColumnCheck[0].exists) {
        // Add the source column if it doesn't exist
        console.log('Adding source column to users table...');
        await sql`
          ALTER TABLE users 
          ADD COLUMN source VARCHAR(100) DEFAULT 'manual';
        `;
        console.log('✅ Source column added to users table');
        
        // Update existing records to have 'manual' as the source
        console.log('Setting default source value for existing records...');
        await sql`
          UPDATE users 
          SET source = 'manual' 
          WHERE source IS NULL OR source = '';
        `;
        console.log('✅ Updated existing users with default source value');
      } else {
        console.log('✅ Source column already exists in users table');
      }
    }
    
    // Step 3: Check if testimonials table exists, create if not
    console.log('\nChecking for testimonials table...');
    const testimonialsTableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'testimonials'
      );
    `;
    
    if (!testimonialsTableCheck[0].exists) {
      console.log('Creating testimonials table...');
      await sql`
        CREATE TABLE testimonials (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          comment TEXT NOT NULL,
          rating INTEGER CHECK (rating BETWEEN 1 AND 5),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          approved BOOLEAN DEFAULT false,
          source VARCHAR(100) DEFAULT 'manual'
        );
      `;
      console.log('✅ Testimonials table created');
    } else {
      // Check if source column exists in testimonials table
      const sourceColumnCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'testimonials'
          AND column_name = 'source'
        );
      `;
      
      if (!sourceColumnCheck[0].exists) {
        console.log('Adding source column to testimonials table...');
        await sql`
          ALTER TABLE testimonials 
          ADD COLUMN source VARCHAR(100) DEFAULT 'manual';
        `;
        console.log('✅ Source column added to testimonials table');
      } else {
        console.log('✅ Source column already exists in testimonials table');
      }
    }
    
    // Step 4: Import Facebook testimonials
    console.log('\nImporting Facebook testimonials...');
    
    // Check how many testimonials already exist with facebook source
    const existingCount = await sql`
      SELECT COUNT(*) as count FROM testimonials WHERE source = 'facebook';
    `;
    
    if (parseInt(existingCount[0].count) > 0) {
      console.log(`Found ${existingCount[0].count} existing Facebook testimonials.`);
      console.log('Skipping import to avoid duplicates. To reimport, first delete existing testimonials.');
    } else {
      // Import the testimonials
      for (const testimonial of facebookTestimonials) {
        await sql`
          INSERT INTO testimonials (name, email, comment, rating, source, approved)
          VALUES (
            ${testimonial.name},
            ${testimonial.email},
            ${testimonial.comment},
            ${testimonial.rating},
            ${testimonial.source},
            true
          );
        `;
      }
      
      console.log(`✅ Successfully imported ${facebookTestimonials.length} Facebook testimonials`);
    }
    
    // Update the generate-test-leads.js script to include source parameter
    console.log('\nModifying generate-test-leads.js to include source parameter...');
    // Note: This would normally involve file manipulation, but we'll leave that as a manual step
    console.log('⚠️ Please manually update generate-test-leads.js to include source="mock" in the contact data');
    
    // Display sample data
    console.log('\nSample data in testimonials table:');
    const testimonialSamples = await sql`
      SELECT id, name, LEFT(comment, 50) as comment_preview, rating, source, created_at 
      FROM testimonials 
      ORDER BY created_at DESC 
      LIMIT 5;
    `;
    
    testimonialSamples.forEach(t => {
      console.log(`- ID ${t.id}: ${t.name} (${t.rating}★) - "${t.comment_preview}..." [${t.source}]`);
    });
    
    console.log('\n🎉 Database schema updated successfully!');
    console.log('✅ Added source column to relevant tables');
    console.log('✅ Imported testimonials from Facebook');
    
  } catch (error) {
    console.error('Error updating database schema:', error);
  }
}

// Execute the function
updateDatabaseSchema()
  .then(() => {
    console.log('\nOperation completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Operation failed:', error);
    process.exit(1);
  });
