
import { connectDB } from '../platform/database/db.js';
import { reportPasswordResetReadiness } from '../modules/identity/index.js';
import { runAutoMigration } from '../modules/community/index.js';
import { initializeFlashcardAccess } from '../modules/access/index.js';
import { initializeCourseAccess } from '../modules/access/index.js';
import { initializeCourseCommerce } from '../modules/commerce/index.js';
import { seedStudyContent } from '../modules/learning/index.js';
import { startCommerceMaintenance } from '../modules/commerce/index.js';
import { initializeSupportPayments } from '../modules/commerce/index.js';
import { commerceReady } from '../modules/commerce/index.js';
import { initializeNotificationDelivery,startNotificationDelivery } from '../modules/notifications/index.js';
import { notificationSources,expandNotificationCampaigns,generateStudyReminders,initializeNotificationSources,validateNotificationDelivery } from './notification-sources.js';

let initialization;
let maintenanceStop;
let notificationStop;
// Called explicitly before listen; importing a module never connects or seeds DB.
export function initializeStorage() {
 if (!initialization) initialization = (async () => {
     reportPasswordResetReadiness();
    const connected = await connectDB(runAutoMigration);
    if (connected) {
      try { await initializeNotificationDelivery(); await initializeNotificationSources(); console.log('[Notifications] Stores ready.'); }
      catch(error) { console.error('[Notifications] Initialization deferred:',error.code || error.name); }
      try { await initializeSupportPayments(); console.log('[Support payments] Indexes ready.'); }
      catch (error) { console.error('[Support payments] Initialization failed:', error.code || error.name); }
      try {
        await initializeFlashcardAccess();
        console.log('[Flashcard access] Indexes ready.');
      } catch (error) {
        // Keep authentication and other modules available. Flashcard access
        // fails closed until its required unique indexes have been initialized.
        console.error('[Flashcard access] Initialization failed; access APIs remain unavailable:', error.code || error.name);
      }
      await seedStudyContent();
      try {
        await initializeCourseAccess();
        console.log('[Course access] Indexes ready.');
      } catch (error) {
        console.error('[Course access] Initialization failed; key APIs remain unavailable:', error.code || error.name);
      }
      try {
        await initializeCourseCommerce();
        console.log('[Course commerce] Ready.');
      } catch (error) { console.error('[Course commerce] Initialization failed:', error.code || error.name); }
    }

 })().catch(error => { initialization = undefined; throw error; });
 return initialization;
}
export function stopBackgroundWork() { maintenanceStop?.(); maintenanceStop = undefined; notificationStop?.(); notificationStop=undefined; }
export function startBackgroundWork() {
  if(!notificationStop) notificationStop=startNotificationDelivery({sources:notificationSources,expandCampaigns:expandNotificationCampaigns,reminders:generateStudyReminders,prepareSources:initializeNotificationSources,validateDelivery:validateNotificationDelivery});
  if (!maintenanceStop && commerceReady()) maintenanceStop = startCommerceMaintenance();
}
