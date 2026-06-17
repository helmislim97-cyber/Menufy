import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { H as redirect } from "../_libs/tanstack__router-core.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-CjM7Gvsx.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import { o as objectType, e as enumType } from "../_libs/zod.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const appCss = "/assets/styles-fXotuYHC.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const en = {
  "nav.features": "Features",
  "nav.pricing": "Pricing",
  "nav.howItWorks": "How it works",
  "nav.login": "Log in",
  "nav.register": "Get started",
  "hero.badge": "New · Tunisia 🇹🇳",
  "hero.title": "Your restaurant, digitized in 48h",
  "hero.subtitle": "Your customers scan a QR code, order from their phone, and you receive orders in the kitchen in real time.",
  "hero.cta": "Get started for free",
  "hero.cta2": "See a demo",
  "how.title": "How it works",
  "how.subtitle": "Three steps, zero friction",
  "how.step1.title": "Scan",
  "how.step1.desc": "The customer scans the QR code on the table.",
  "how.step2.title": "Order",
  "how.step2.desc": "They browse your menu and place an order in seconds.",
  "how.step3.title": "Serve",
  "how.step3.desc": "The kitchen receives the order instantly and prepares it.",
  "features.title": "Everything you need",
  "features.subtitle": "A complete platform to digitize your restaurant",
  "features.1.title": "Digital menu",
  "features.1.desc": "Edit your dishes, prices, and availability in one click.",
  "features.2.title": "Real-time kitchen",
  "features.2.desc": "Orders arrive instantly on the kitchen screen.",
  "features.3.title": "QR codes per table",
  "features.3.desc": "A unique QR code per table, printable in one click.",
  "features.4.title": "Built-in cash register",
  "features.4.desc": "Print bills and mark payments.",
  "features.5.title": "Bilingual AR/FR",
  "features.5.desc": "Your customers order in their own language.",
  "features.6.title": "Mobile-first",
  "features.6.desc": "Manage your restaurant from your phone.",
  "pricing.title": "Simple pricing",
  "pricing.subtitle": "Choose the plan that fits your restaurant",
  "pricing.free.name": "Free",
  "pricing.free.price": "0 DT",
  "pricing.free.desc": "To try out Menufy",
  "pricing.pro.name": "Pro",
  "pricing.pro.price": "199 DT",
  "pricing.pro.period": "/month",
  "pricing.pro.desc": "For active restaurants",
  "pricing.entr.name": "Enterprise",
  "pricing.entr.price": "Custom",
  "pricing.entr.desc": "For chains",
  "pricing.cta": "Get started",
  "pricing.popular": "Popular",
  "pricing.feat.tables": "tables",
  "pricing.feat.unlimited": "Unlimited tables",
  "pricing.feat.menu": "Unlimited menu",
  "pricing.feat.realtime": "Real-time orders",
  "pricing.feat.qr": "Printable QR codes",
  "pricing.feat.support": "Priority support",
  "pricing.feat.multi": "Multi-restaurant",
  "pricing.feat.api": "Custom API",
  "cta.title": "Ready to digitize your restaurant?",
  "cta.subtitle": "Join Tunisian restaurateurs modernizing their service.",
  "cta.button": "Get started for free",
  "footer.tagline": "The QR menu solution for Tunisian restaurants.",
  "footer.rights": "All rights reserved.",
  "auth.login.title": "Welcome back",
  "auth.login.subtitle": "Sign in to your restaurant space",
  "auth.register.title": "Create your restaurant",
  "auth.register.subtitle": "Launch your digital menu in seconds",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.fullName": "Your name",
  "auth.restaurantName": "Restaurant name",
  "auth.login.button": "Sign in",
  "auth.register.button": "Create my restaurant",
  "auth.toRegister": "Don't have an account yet?",
  "auth.toLogin": "Already have an account?",
  "auth.signUp": "Sign up",
  "auth.signIn": "Sign in",
  "nav.dashboard.home": "Home",
  "nav.dashboard.orders": "Orders",
  "nav.dashboard.menu": "Menu",
  "nav.dashboard.settings": "Settings",
  "menu.title": "My menu",
  "menu.subtitle": "Manage your categories and products.",
  "menu.addCategory": "New category",
  "menu.addProduct": "Add a product",
  "menu.editCategory": "Edit category",
  "menu.editProduct": "Edit product",
  "menu.categoryName": "Category name",
  "menu.categoryNamePlaceholder": "E.g. Drinks",
  "menu.noCategoriesYet": "No categories yet.",
  "menu.noCategoriesHint": "Create your first category to start adding products.",
  "menu.noProducts": "No products in this category.",
  "menu.productName": "Product name",
  "menu.productNamePlaceholder": "E.g. Couscous",
  "menu.description": "Description",
  "menu.descriptionPlaceholder": "Optional",
  "menu.price": "Price (DT)",
  "menu.emoji": "Emoji",
  "menu.category": "Category",
  "menu.available": "Available",
  "menu.unavailable": "Unavailable",
  "menu.save": "Save",
  "menu.cancel": "Cancel",
  "menu.edit": "Edit",
  "menu.delete": "Delete",
  "menu.uncategorized": "Uncategorized",
  "menu.categoryAdded": "Category added ✅",
  "menu.categoryUpdated": "Category updated ✅",
  "menu.categoryDeleted": "Category deleted",
  "menu.productAdded": "Product added ✅",
  "menu.productUpdated": "Product updated ✅",
  "menu.productDeleted": "Product deleted",
  "menu.confirmDeleteCategory": "Delete this category and all its products?",
  "menu.confirmDeleteProduct": "Delete this product?",
  "menu.loading": "Loading…",
  "menu.noRestaurant": "No restaurant found for this account.",
  "client.table": "Table",
  "client.notFound.title": "Restaurant not found",
  "client.notFound.subtitle": "This link seems invalid or the restaurant is no longer active.",
  "client.empty": "No products available right now.",
  "client.add": "Add",
  "client.unavailable": "Unavailable",
  "client.cartButton": "View my order",
  "client.cartTitle": "My order",
  "client.cartEmpty": "Your cart is empty.",
  "client.notes": "Note for the kitchen",
  "client.notesPlaceholder": "E.g. no onions, mild spice… (optional)",
  "client.total": "Total",
  "client.confirmOrder": "Confirm order",
  "client.placing": "Sending…",
  "client.backToMenu": "Back to menu",
  "client.success.title": "Order sent ✅",
  "client.success.subtitle": "Your order is being prepared. The waiter will bring it to you shortly.",
  "client.success.table": "Table",
  "client.success.newOrder": "Place a new order",
  "client.sessionExpired.title": "Please rescan the QR code",
  "client.sessionExpired.subtitle": "Your session has expired. Please scan the QR code on your table again to continue.",
  "client.sessionExpired.continue": "I rescanned, continue",
  "client.item": "item",
  "client.items": "items",
  "orders.title": "Orders",
  "orders.subtitle": "Track your orders in real time.",
  "orders.empty": "No orders yet.",
  "orders.emptyHint": "Your customers' orders will appear here instantly.",
  "orders.active": "Active orders",
  "orders.history": "History",
  "orders.table": "Table",
  "orders.notes": "Note",
  "orders.total": "Total",
  "orders.status.pending": "New",
  "orders.status.preparing": "Preparing",
  "orders.status.ready": "Ready",
  "orders.status.paid": "Paid",
  "orders.status.cancelled": "Cancelled",
  "orders.action.start": "Start",
  "orders.action.ready": "Mark ready",
  "orders.action.paid": "Mark paid",
  "orders.action.cancel": "Cancel",
  "settings.title": "Settings",
  "settings.restaurant": "Restaurant",
  "settings.account": "Account",
  "settings.logout": "Log out",
  "settings.tables": "Tables",
  "settings.tablesSubtitle": "Manage your tables and generate their QR codes.",
  "settings.addTable": "Add table",
  "settings.tableNumber": "Table number",
  "settings.tableNumberPlaceholder": "E.g. 12",
  "settings.noTables": "No tables yet.",
  "settings.table": "Table",
  "settings.viewQr": "View QR",
  "settings.qrTitle": "QR Code",
  "settings.qrHint": "Print this code and place it on the table. Customers scan it to access the menu.",
  "settings.openLink": "Open link",
  "settings.downloadQr": "Download QR",
  "settings.active": "Active",
  "settings.inactive": "Inactive",
  "settings.confirmDeleteTable": "Delete this table?",
  "settings.tableAdded": "Table added ✅",
  "settings.tableDeleted": "Table deleted",
  "settings.save": "Save",
  "settings.cancel": "Cancel",
  "kitchen.title": "Kitchen",
  "kitchen.subtitle": "Kitchen mode — tap to advance an order.",
  "kitchen.empty": "No orders waiting.",
  "kitchen.exit": "Exit",
  "kitchen.openKitchen": "Kitchen mode",
  "kitchen.newOrder": "New",
  "cashier.title": "Cashier",
  "cashier.subtitle": "Bills by table — collect payment in one tap.",
  "cashier.empty": "No bills waiting.",
  "cashier.table": "Table",
  "cashier.total": "Total due",
  "cashier.markPaid": "Mark paid",
  "cashier.exit": "Exit",
  "cashier.openCashier": "Cashier mode",
  "cashier.ordersCount": "order(s)",
  "cashier.confirmPaid": "Mark this table as paid?",
  "settings.editRestaurant": "Edit",
  "settings.editRestaurantTitle": "Edit restaurant",
  "settings.restaurantName": "Name",
  "settings.address": "Address",
  "settings.phone": "Phone",
  "settings.addressPlaceholder": "E.g. Avenue Habib Bourguiba, Tunis",
  "settings.phonePlaceholder": "E.g. +216 12 345 678",
  "settings.restaurantUpdated": "Restaurant updated ✅",
  "settings.noAddress": "No address set",
  "settings.noPhone": "No phone set",
  "orders.todayRevenue": "Today's revenue",
  "orders.todayOrders": "Paid orders",
  "menu.photo": "Photo",
  "menu.addPhoto": "Add a photo",
  "menu.changePhoto": "Change",
  "menu.removePhoto": "Remove",
  "client.searchPlaceholder": "Search for a dish...",
  "client.supplements": "Supplements",
  "client.noResults": "No results for this search.",
  "client.orderNow": "Order now",
  "client.followUs": "Follow us",
  "settings.description": "Description",
  "settings.descriptionPlaceholder": "E.g. Traditional Tunisian cuisine, open 7 days a week…",
  "client.info": "Information",
  "client.address": "Address",
  "client.reservation": "Reservations",
  "client.wifi": "Wi-Fi",
  "client.soldOut": "Sold out",
  "client.addToCart": "Add to cart",
  "client.itemNote": "Note for this item",
  "client.itemNotePlaceholder": "E.g. no onions... (optional)",
  "client.yourInfo": "Your information",
  "client.firstName": "First name",
  "client.lastName": "Last name",
  "client.phone": "Phone",
  "client.firstNamePlaceholder": "Your first name",
  "client.lastNamePlaceholder": "Your last name",
  "client.phonePlaceholder": "Your phone number",
  "client.fillRequiredInfo": "Please fill in your information to confirm.",
  "client.missingInfoError": "Please enter your name, last name, and phone number before confirming.",
  "orders.customer": "Customer",
  "menu.categoryDescription": "Tagline (optional)",
  "menu.categoryDescriptionPlaceholder": "E.g. Hearty plates for every craving",
  "menu.kcal": "Calories (kcal)",
  "menu.prepMinutes": "Prep time (min)",
  "menu.badge": "Badge (e.g. Signature, Vegan)",
  "menu.badgePlaceholder": "E.g. Signature",
  "menu.tags": "Tags (comma-separated)",
  "menu.tagsPlaceholder": "E.g. cheese, nuts, gluten-free",
  "menu.supplements": "Supplements",
  "menu.supplementsHint": "Save the product first, then edit it to add supplements.",
  "menu.supplementNamePlaceholder": "E.g. Mozzarella",
  "client.kcal": "kcal",
  "client.min": "min",
  "client.soldOut": "Sold out",
  "client.addToCart": "Add to cart",
  "client.itemNote": "Note for this item",
  "client.itemNotePlaceholder": "E.g. no onions... (optional)",
  "client.yourInfo": "Your information",
  "client.firstName": "First name",
  "client.lastName": "Last name",
  "client.phone": "Phone",
  "client.firstNamePlaceholder": "Your first name",
  "client.lastNamePlaceholder": "Your last name",
  "client.phonePlaceholder": "Your phone number",
  "client.fillRequiredInfo": "Please fill in your information to confirm.",
  "client.missingInfoError": "Please enter your name, last name, and phone number before confirming.",
  "orders.customer": "Customer",
  "client.poweredBy": "Powered by",
  "client.allRightsReserved": "All rights reserved.",
  "settings.wifi": "Wi-Fi password",
  "settings.wifiPlaceholder": "E.g. MyRestaurant2024",
  "settings.banner": "Cover photo",
  "settings.bannerAdjust": "Adjust position",
  "settings.bannerZoom": "Zoom",
  "settings.bannerHint": "Drag the image to reposition it",
  "settings.logo": "Logo",
  "settings.facebook": "Facebook",
  "settings.instagram": "Instagram",
  "settings.facebookPlaceholder": "https://facebook.com/yourpage",
  "settings.instagramPlaceholder": "https://instagram.com/youraccount"
};
const fr = {
  "nav.features": "Fonctionnalités",
  "nav.pricing": "Tarifs",
  "nav.howItWorks": "Comment ça marche",
  "nav.login": "Connexion",
  "nav.register": "Commencer",
  "hero.badge": "Nouveau · Tunisie 🇹🇳",
  "hero.title": "Votre restaurant, digitalisé en 48h",
  "hero.subtitle": "Vos clients scannent un QR code, commandent depuis leur téléphone et vous recevez les commandes en cuisine en temps réel.",
  "hero.cta": "Commencer gratuitement",
  "hero.cta2": "Voir une démo",
  "how.title": "Comment ça marche",
  "how.subtitle": "Trois étapes, zéro friction",
  "how.step1.title": "Scanner",
  "how.step1.desc": "Le client scanne le QR code posé sur la table.",
  "how.step2.title": "Commander",
  "how.step2.desc": "Il parcourt votre menu et passe commande en quelques secondes.",
  "how.step3.title": "Servir",
  "how.step3.desc": "La cuisine reçoit la commande instantanément et la prépare.",
  "features.title": "Tout ce qu'il vous faut",
  "features.subtitle": "Une plateforme complète pour digitaliser votre restaurant",
  "features.1.title": "Menu digital",
  "features.1.desc": "Modifiez vos plats, prix et disponibilités en un clic.",
  "features.2.title": "Cuisine temps réel",
  "features.2.desc": "Les commandes arrivent instantanément sur l'écran cuisine.",
  "features.3.title": "QR codes par table",
  "features.3.desc": "Un QR unique par table, à imprimer en un clic.",
  "features.4.title": "Caisse intégrée",
  "features.4.desc": "Imprimez les additions et marquez les paiements.",
  "features.5.title": "Bilingue AR/FR",
  "features.5.desc": "Vos clients commandent dans leur langue.",
  "features.6.title": "Mobile-first",
  "features.6.desc": "Gérez votre restaurant depuis votre téléphone.",
  "pricing.title": "Des tarifs simples",
  "pricing.subtitle": "Choisissez le plan adapté à votre restaurant",
  "pricing.free.name": "Gratuit",
  "pricing.free.price": "0 DT",
  "pricing.free.desc": "Pour tester Menufy",
  "pricing.pro.name": "Pro",
  "pricing.pro.price": "199 DT",
  "pricing.pro.period": "/mois",
  "pricing.pro.desc": "Pour les restaurants actifs",
  "pricing.entr.name": "Entreprise",
  "pricing.entr.price": "Sur devis",
  "pricing.entr.desc": "Pour les chaînes",
  "pricing.cta": "Commencer",
  "pricing.popular": "Populaire",
  "pricing.feat.tables": "tables",
  "pricing.feat.unlimited": "Tables illimitées",
  "pricing.feat.menu": "Menu illimité",
  "pricing.feat.realtime": "Commandes temps réel",
  "pricing.feat.qr": "QR codes imprimables",
  "pricing.feat.support": "Support prioritaire",
  "pricing.feat.multi": "Multi-restaurants",
  "pricing.feat.api": "API personnalisée",
  "cta.title": "Prêt à digitaliser votre restaurant ?",
  "cta.subtitle": "Rejoignez les restaurateurs tunisiens qui modernisent leur service.",
  "cta.button": "Commencer gratuitement",
  "footer.tagline": "La solution QR menu pour les restaurants tunisiens.",
  "footer.rights": "Tous droits réservés.",
  "auth.login.title": "Bienvenue",
  "auth.login.subtitle": "Connectez-vous à votre espace restaurant",
  "auth.register.title": "Créer votre restaurant",
  "auth.register.subtitle": "Lancez votre menu digital en quelques secondes",
  "auth.email": "Email",
  "auth.password": "Mot de passe",
  "auth.fullName": "Votre nom",
  "auth.restaurantName": "Nom du restaurant",
  "auth.login.button": "Se connecter",
  "auth.register.button": "Créer mon restaurant",
  "auth.toRegister": "Pas encore de compte ?",
  "auth.toLogin": "Déjà un compte ?",
  "auth.signUp": "S'inscrire",
  "auth.signIn": "Se connecter",
  "nav.dashboard.home": "Accueil",
  "nav.dashboard.orders": "Commandes",
  "nav.dashboard.menu": "Menu",
  "nav.dashboard.settings": "Réglages",
  "menu.title": "Mon menu",
  "menu.subtitle": "Gérez vos catégories et vos produits.",
  "menu.addCategory": "Nouvelle catégorie",
  "menu.addProduct": "Ajouter un produit",
  "menu.editCategory": "Modifier la catégorie",
  "menu.editProduct": "Modifier le produit",
  "menu.categoryName": "Nom de la catégorie",
  "menu.categoryNamePlaceholder": "Ex : Boissons",
  "menu.noCategoriesYet": "Aucune catégorie pour le moment.",
  "menu.noCategoriesHint": "Créez votre première catégorie pour commencer à ajouter des produits.",
  "menu.noProducts": "Aucun produit dans cette catégorie.",
  "menu.productName": "Nom du produit",
  "menu.productNamePlaceholder": "Ex : Couscous",
  "menu.description": "Description",
  "menu.descriptionPlaceholder": "Optionnel",
  "menu.price": "Prix (DT)",
  "menu.emoji": "Émoji",
  "menu.category": "Catégorie",
  "menu.available": "Disponible",
  "menu.unavailable": "Indisponible",
  "menu.save": "Enregistrer",
  "menu.cancel": "Annuler",
  "menu.edit": "Modifier",
  "menu.delete": "Supprimer",
  "menu.uncategorized": "Sans catégorie",
  "menu.categoryAdded": "Catégorie ajoutée ✅",
  "menu.categoryUpdated": "Catégorie mise à jour ✅",
  "menu.categoryDeleted": "Catégorie supprimée",
  "menu.productAdded": "Produit ajouté ✅",
  "menu.productUpdated": "Produit mis à jour ✅",
  "menu.productDeleted": "Produit supprimé",
  "menu.confirmDeleteCategory": "Supprimer cette catégorie et tous ses produits ?",
  "menu.confirmDeleteProduct": "Supprimer ce produit ?",
  "menu.loading": "Chargement…",
  "menu.noRestaurant": "Aucun restaurant trouvé pour ce compte.",
  "client.table": "Table",
  "client.notFound.title": "Restaurant introuvable",
  "client.notFound.subtitle": "Ce lien semble invalide ou le restaurant n'est plus actif.",
  "client.empty": "Aucun produit disponible pour le moment.",
  "client.add": "Ajouter",
  "client.unavailable": "Indisponible",
  "client.cartButton": "Voir ma commande",
  "client.cartTitle": "Ma commande",
  "client.cartEmpty": "Votre panier est vide.",
  "client.notes": "Note pour la cuisine",
  "client.notesPlaceholder": "Ex : sans oignons, peu épicé… (optionnel)",
  "client.total": "Total",
  "client.confirmOrder": "Confirmer la commande",
  "client.placing": "Envoi en cours…",
  "client.backToMenu": "Retour au menu",
  "client.success.title": "Commande envoyée ✅",
  "client.success.subtitle": "Votre commande est en préparation. Le serveur vous l'apportera bientôt.",
  "client.success.table": "Table",
  "client.success.newOrder": "Passer une nouvelle commande",
  "client.sessionExpired.title": "Veuillez rescanner le QR code",
  "client.sessionExpired.subtitle": "Votre session a expiré. Merci de scanner à nouveau le QR code sur votre table pour continuer.",
  "client.sessionExpired.continue": "J'ai rescanné, continuer",
  "client.item": "article",
  "client.items": "articles",
  "orders.title": "Commandes",
  "orders.subtitle": "Suivez vos commandes en temps réel.",
  "orders.empty": "Aucune commande pour le moment.",
  "orders.emptyHint": "Les commandes de vos clients apparaîtront ici instantanément.",
  "orders.active": "Commandes actives",
  "orders.history": "Historique",
  "orders.table": "Table",
  "orders.notes": "Note",
  "orders.total": "Total",
  "orders.status.pending": "Nouvelle",
  "orders.status.preparing": "En préparation",
  "orders.status.ready": "Prête",
  "orders.status.paid": "Payée",
  "orders.status.cancelled": "Annulée",
  "orders.action.start": "Commencer",
  "orders.action.ready": "Marquer prête",
  "orders.action.paid": "Marquer payée",
  "orders.action.cancel": "Annuler",
  "settings.title": "Réglages",
  "settings.restaurant": "Restaurant",
  "settings.account": "Compte",
  "settings.logout": "Se déconnecter",
  "settings.tables": "Tables",
  "settings.tablesSubtitle": "Gérez vos tables et générez leurs QR codes.",
  "settings.addTable": "Ajouter une table",
  "settings.tableNumber": "Numéro de table",
  "settings.tableNumberPlaceholder": "Ex : 12",
  "settings.noTables": "Aucune table pour le moment.",
  "settings.table": "Table",
  "settings.viewQr": "Voir le QR",
  "settings.qrTitle": "QR Code",
  "settings.qrHint": "Imprimez ce code et placez-le sur la table. Les clients le scannent pour accéder au menu.",
  "settings.openLink": "Ouvrir le lien",
  "settings.downloadQr": "Télécharger le QR",
  "settings.active": "Active",
  "settings.inactive": "Inactive",
  "settings.confirmDeleteTable": "Supprimer cette table ?",
  "settings.tableAdded": "Table ajoutée ✅",
  "settings.tableDeleted": "Table supprimée",
  "settings.save": "Enregistrer",
  "settings.cancel": "Annuler",
  "kitchen.title": "Cuisine",
  "kitchen.subtitle": "Mode cuisine — appuyez pour faire avancer une commande.",
  "kitchen.empty": "Aucune commande en attente.",
  "kitchen.exit": "Quitter",
  "kitchen.openKitchen": "Mode cuisine",
  "kitchen.newOrder": "Nouvelle",
  "cashier.title": "Caisse",
  "cashier.subtitle": "Additions par table — encaissez en un clic.",
  "cashier.empty": "Aucune addition en attente.",
  "cashier.table": "Table",
  "cashier.total": "Total à payer",
  "cashier.markPaid": "Encaisser",
  "cashier.exit": "Quitter",
  "cashier.openCashier": "Mode caisse",
  "cashier.ordersCount": "commande(s)",
  "cashier.confirmPaid": "Marquer cette table comme payée ?",
  "settings.editRestaurant": "Modifier",
  "settings.editRestaurantTitle": "Modifier le restaurant",
  "settings.restaurantName": "Nom",
  "settings.address": "Adresse",
  "settings.phone": "Téléphone",
  "settings.addressPlaceholder": "Ex : Avenue Habib Bourguiba, Tunis",
  "settings.phonePlaceholder": "Ex : +216 12 345 678",
  "settings.restaurantUpdated": "Restaurant mis à jour ✅",
  "settings.noAddress": "Adresse non renseignée",
  "settings.noPhone": "Téléphone non renseigné",
  "orders.todayRevenue": "Revenus aujourd'hui",
  "orders.todayOrders": "Commandes payées",
  "menu.photo": "Photo",
  "menu.addPhoto": "Ajouter une photo",
  "menu.changePhoto": "Changer",
  "menu.removePhoto": "Supprimer",
  "client.searchPlaceholder": "Rechercher un plat...",
  "client.supplements": "Suppléments",
  "client.noResults": "Aucun résultat pour cette recherche.",
  "client.orderNow": "Commander",
  "client.followUs": "Suivez-nous",
  "settings.description": "Description",
  "settings.descriptionPlaceholder": "Ex : Cuisine tunisienne traditionnelle, ouvert 7j/7…",
  "client.info": "Informations",
  "client.address": "Adresse",
  "client.reservation": "Réservations",
  "client.wifi": "Wifi",
  "client.poweredBy": "Propulsé par",
  "client.allRightsReserved": "Tous droits réservés.",
  "client.soldOut": "Épuisé",
  "client.addToCart": "Ajouter au panier",
  "client.itemNote": "Note pour cet article",
  "client.itemNotePlaceholder": "Ex : sans oignons... (optionnel)",
  "client.yourInfo": "Vos informations",
  "client.firstName": "Prénom",
  "client.lastName": "Nom",
  "client.phone": "Téléphone",
  "client.firstNamePlaceholder": "Votre prénom",
  "client.lastNamePlaceholder": "Votre nom",
  "client.phonePlaceholder": "Votre numéro de téléphone",
  "client.fillRequiredInfo": "Veuillez remplir vos informations pour confirmer.",
  "client.missingInfoError": "Veuillez entrer votre nom, prénom et numéro de téléphone avant de confirmer.",
  "orders.customer": "Client",
  "menu.categoryDescription": "Slogan (optionnel)",
  "menu.categoryDescriptionPlaceholder": "Ex : Des plats copieux pour toutes les envies",
  "menu.kcal": "Calories (kcal)",
  "menu.prepMinutes": "Temps de préparation (min)",
  "menu.badge": "Badge (ex: Signature, Vegan)",
  "menu.badgePlaceholder": "Ex : Signature",
  "menu.tags": "Tags (séparés par des virgules)",
  "menu.tagsPlaceholder": "Ex : fromage, noix, sans gluten",
  "menu.supplements": "Suppléments",
  "menu.supplementsHint": "Enregistrez d'abord le produit, puis modifiez-le pour ajouter des suppléments.",
  "menu.supplementNamePlaceholder": "Ex : Mozzarella",
  "client.kcal": "kcal",
  "client.min": "min",
  "client.soldOut": "Épuisé",
  "client.addToCart": "Ajouter au panier",
  "client.itemNote": "Note pour cet article",
  "client.itemNotePlaceholder": "Ex : sans oignons... (optionnel)",
  "client.yourInfo": "Vos informations",
  "client.firstName": "Prénom",
  "client.lastName": "Nom",
  "client.phone": "Téléphone",
  "client.firstNamePlaceholder": "Votre prénom",
  "client.lastNamePlaceholder": "Votre nom",
  "client.phonePlaceholder": "Votre numéro de téléphone",
  "client.fillRequiredInfo": "Veuillez remplir vos informations pour confirmer.",
  "client.missingInfoError": "Veuillez entrer votre nom, prénom et numéro de téléphone avant de confirmer.",
  "orders.customer": "Client",
  "client.poweredBy": "Propulsé par",
  "client.allRightsReserved": "Tous droits réservés.",
  "settings.wifi": "Mot de passe Wifi",
  "settings.wifiPlaceholder": "Ex : MonRestaurant2024",
  "settings.banner": "Photo de couverture",
  "settings.bannerAdjust": "Ajuster la position",
  "settings.bannerZoom": "Zoom",
  "settings.bannerHint": "Faites glisser l'image pour la repositionner",
  "settings.logo": "Logo",
  "settings.facebook": "Facebook",
  "settings.instagram": "Instagram",
  "settings.facebookPlaceholder": "https://facebook.com/votrepage",
  "settings.instagramPlaceholder": "https://instagram.com/votrecompte"
};
const ar = {
  "nav.features": "المميزات",
  "nav.pricing": "الأسعار",
  "nav.howItWorks": "كيف يعمل",
  "nav.login": "تسجيل الدخول",
  "nav.register": "ابدأ الآن",
  "hero.badge": "جديد · تونس 🇹🇳",
  "hero.title": "مطعمك رقمي في 48 ساعة",
  "hero.subtitle": "زبائنك يمسحون رمز QR، يطلبون من هواتفهم، وتصل الطلبات للمطبخ مباشرة.",
  "hero.cta": "ابدأ مجاناً",
  "hero.cta2": "شاهد عرض",
  "how.title": "كيف يعمل",
  "how.subtitle": "ثلاث خطوات بسيطة",
  "how.step1.title": "امسح",
  "how.step1.desc": "الزبون يمسح رمز QR على الطاولة.",
  "how.step2.title": "اطلب",
  "how.step2.desc": "يتصفح القائمة ويطلب في ثوانٍ.",
  "how.step3.title": "قدّم",
  "how.step3.desc": "المطبخ يستلم الطلب فوراً ويحضّره.",
  "features.title": "كل ما تحتاجه",
  "features.subtitle": "منصة كاملة لرقمنة مطعمك",
  "features.1.title": "قائمة رقمية",
  "features.1.desc": "عدّل الأطباق والأسعار بنقرة.",
  "features.2.title": "مطبخ فوري",
  "features.2.desc": "الطلبات تصل مباشرة على شاشة المطبخ.",
  "features.3.title": "رموز QR للطاولات",
  "features.3.desc": "رمز فريد لكل طاولة، جاهز للطباعة.",
  "features.4.title": "صندوق متكامل",
  "features.4.desc": "اطبع الفواتير وسجّل الدفع.",
  "features.5.title": "عربي/فرنسي",
  "features.5.desc": "زبائنك يطلبون بلغتهم.",
  "features.6.title": "هاتف أولاً",
  "features.6.desc": "أدر مطعمك من هاتفك.",
  "pricing.title": "أسعار بسيطة",
  "pricing.subtitle": "اختر الخطة المناسبة لمطعمك",
  "pricing.free.name": "مجاني",
  "pricing.free.price": "0 د.ت",
  "pricing.free.desc": "لتجربة Menufy",
  "pricing.pro.name": "احترافي",
  "pricing.pro.price": "199 د.ت",
  "pricing.pro.period": "/شهر",
  "pricing.pro.desc": "للمطاعم النشطة",
  "pricing.entr.name": "مؤسسة",
  "pricing.entr.price": "حسب الطلب",
  "pricing.entr.desc": "للسلاسل",
  "pricing.cta": "ابدأ",
  "pricing.popular": "الأكثر طلباً",
  "pricing.feat.tables": "طاولات",
  "pricing.feat.unlimited": "طاولات غير محدودة",
  "pricing.feat.menu": "قائمة غير محدودة",
  "pricing.feat.realtime": "طلبات فورية",
  "pricing.feat.qr": "رموز QR للطباعة",
  "pricing.feat.support": "دعم أولوية",
  "pricing.feat.multi": "عدة مطاعم",
  "pricing.feat.api": "واجهة مخصصة",
  "cta.title": "جاهز لرقمنة مطعمك؟",
  "cta.subtitle": "انضم لأصحاب المطاعم التونسيين الذين يطوّرون خدمتهم.",
  "cta.button": "ابدأ مجاناً",
  "footer.tagline": "حل قائمة QR للمطاعم التونسية.",
  "footer.rights": "جميع الحقوق محفوظة.",
  "auth.login.title": "مرحباً",
  "auth.login.subtitle": "ادخل إلى مساحة مطعمك",
  "auth.register.title": "أنشئ مطعمك",
  "auth.register.subtitle": "أطلق قائمتك الرقمية في ثوانٍ",
  "auth.email": "البريد الإلكتروني",
  "auth.password": "كلمة المرور",
  "auth.fullName": "اسمك",
  "auth.restaurantName": "اسم المطعم",
  "auth.login.button": "تسجيل الدخول",
  "auth.register.button": "أنشئ مطعمي",
  "auth.toRegister": "ليس لديك حساب؟",
  "auth.toLogin": "لديك حساب؟",
  "auth.signUp": "سجّل",
  "auth.signIn": "ادخل",
  "nav.dashboard.home": "الرئيسية",
  "nav.dashboard.orders": "الطلبات",
  "nav.dashboard.menu": "القائمة",
  "nav.dashboard.settings": "الإعدادات",
  "menu.title": "قائمتي",
  "menu.subtitle": "أدر فئاتك ومنتجاتك.",
  "menu.addCategory": "فئة جديدة",
  "menu.addProduct": "أضف منتج",
  "menu.editCategory": "تعديل الفئة",
  "menu.editProduct": "تعديل المنتج",
  "menu.categoryName": "اسم الفئة",
  "menu.categoryNamePlaceholder": "مثال: مشروبات",
  "menu.noCategoriesYet": "لا توجد فئات بعد.",
  "menu.noCategoriesHint": "أنشئ فئتك الأولى لتبدأ في إضافة المنتجات.",
  "menu.noProducts": "لا توجد منتجات في هذه الفئة.",
  "menu.productName": "اسم المنتج",
  "menu.productNamePlaceholder": "مثال: كسكسي",
  "menu.description": "الوصف",
  "menu.descriptionPlaceholder": "اختياري",
  "menu.price": "السعر (د.ت)",
  "menu.emoji": "إيموجي",
  "menu.category": "الفئة",
  "menu.available": "متوفر",
  "menu.unavailable": "غير متوفر",
  "menu.save": "حفظ",
  "menu.cancel": "إلغاء",
  "menu.edit": "تعديل",
  "menu.delete": "حذف",
  "menu.uncategorized": "بدون فئة",
  "menu.categoryAdded": "تمت إضافة الفئة ✅",
  "menu.categoryUpdated": "تم تحديث الفئة ✅",
  "menu.categoryDeleted": "تم حذف الفئة",
  "menu.productAdded": "تمت إضافة المنتج ✅",
  "menu.productUpdated": "تم تحديث المنتج ✅",
  "menu.productDeleted": "تم حذف المنتج",
  "menu.confirmDeleteCategory": "حذف هذه الفئة وكل منتجاتها؟",
  "menu.confirmDeleteProduct": "حذف هذا المنتج؟",
  "menu.loading": "جاري التحميل…",
  "menu.noRestaurant": "لم يتم العثور على مطعم لهذا الحساب.",
  "client.table": "طاولة",
  "client.notFound.title": "المطعم غير موجود",
  "client.notFound.subtitle": "هذا الرابط غير صالح أو المطعم غير نشط حالياً.",
  "client.empty": "لا توجد منتجات متوفرة حالياً.",
  "client.add": "أضف",
  "client.unavailable": "غير متوفر",
  "client.cartButton": "عرض طلبي",
  "client.cartTitle": "طلبي",
  "client.cartEmpty": "سلتك فارغة.",
  "client.notes": "ملاحظة للمطبخ",
  "client.notesPlaceholder": "مثال: بدون بصل، قليل الحار… (اختياري)",
  "client.total": "المجموع",
  "client.confirmOrder": "تأكيد الطلب",
  "client.placing": "جاري الإرسال…",
  "client.backToMenu": "العودة للقائمة",
  "client.success.title": "تم إرسال طلبك ✅",
  "client.success.subtitle": "طلبك قيد التحضير. سيقدمه لك النادل قريباً.",
  "client.success.table": "طاولة",
  "client.success.newOrder": "طلب جديد",
  "client.sessionExpired.title": "يرجى إعادة مسح رمز QR",
  "client.sessionExpired.subtitle": "انتهت جلستك. يرجى مسح رمز QR الموجود على طاولتك مرة أخرى للمتابعة.",
  "client.sessionExpired.continue": "تم إعادة المسح، متابعة",
  "client.item": "منتج",
  "client.items": "منتجات",
  "orders.title": "الطلبات",
  "orders.subtitle": "تابع طلباتك في الوقت الحقيقي.",
  "orders.empty": "لا توجد طلبات حالياً.",
  "orders.emptyHint": "ستظهر طلبات زبائنك هنا فوراً.",
  "orders.active": "الطلبات النشطة",
  "orders.history": "السجل",
  "orders.table": "طاولة",
  "orders.notes": "ملاحظة",
  "orders.total": "المجموع",
  "orders.status.pending": "جديدة",
  "orders.status.preparing": "قيد التحضير",
  "orders.status.ready": "جاهزة",
  "orders.status.paid": "مدفوعة",
  "orders.status.cancelled": "ملغاة",
  "orders.action.start": "ابدأ التحضير",
  "orders.action.ready": "جاهزة",
  "orders.action.paid": "تم الدفع",
  "orders.action.cancel": "إلغاء",
  "settings.title": "الإعدادات",
  "settings.restaurant": "المطعم",
  "settings.account": "الحساب",
  "settings.logout": "تسجيل الخروج",
  "settings.tables": "الطاولات",
  "settings.tablesSubtitle": "أدر طاولاتك وأنشئ رموز QR الخاصة بها.",
  "settings.addTable": "إضافة طاولة",
  "settings.tableNumber": "رقم الطاولة",
  "settings.tableNumberPlaceholder": "مثال: 12",
  "settings.noTables": "لا توجد طاولات بعد.",
  "settings.table": "طاولة",
  "settings.viewQr": "عرض QR",
  "settings.qrTitle": "رمز QR",
  "settings.qrHint": "اطبع هذا الرمز وضعه على الطاولة. يقوم الزبائن بمسحه للوصول إلى القائمة.",
  "settings.openLink": "فتح الرابط",
  "settings.downloadQr": "تنزيل QR",
  "settings.active": "نشطة",
  "settings.inactive": "غير نشطة",
  "settings.confirmDeleteTable": "حذف هذه الطاولة؟",
  "settings.tableAdded": "تمت إضافة الطاولة ✅",
  "settings.tableDeleted": "تم حذف الطاولة",
  "settings.save": "حفظ",
  "settings.cancel": "إلغاء",
  "kitchen.title": "المطبخ",
  "kitchen.subtitle": "وضع المطبخ — اضغط لتمرير الطلب للمرحلة التالية.",
  "kitchen.empty": "لا توجد طلبات في الانتظار.",
  "kitchen.exit": "خروج",
  "kitchen.openKitchen": "وضع المطبخ",
  "kitchen.newOrder": "جديدة",
  "cashier.title": "الصندوق",
  "cashier.subtitle": "الفواتير حسب الطاولة — اضغط للدفع.",
  "cashier.empty": "لا توجد فواتير في الانتظار.",
  "cashier.table": "طاولة",
  "cashier.total": "المجموع المطلوب",
  "cashier.markPaid": "تحصيل الدفع",
  "cashier.exit": "خروج",
  "cashier.openCashier": "وضع الصندوق",
  "cashier.ordersCount": "طلب(ات)",
  "cashier.confirmPaid": "تعليم هذه الطاولة كمدفوعة؟",
  "settings.editRestaurant": "تعديل",
  "settings.editRestaurantTitle": "تعديل المطعم",
  "settings.restaurantName": "الاسم",
  "settings.address": "العنوان",
  "settings.phone": "الهاتف",
  "settings.addressPlaceholder": "مثال: شارع الحبيب بورقيبة، تونس",
  "settings.phonePlaceholder": "مثال: ٢١٦+ ١٢ ٣٤٥ ٦٧٨",
  "settings.restaurantUpdated": "تم تحديث المطعم ✅",
  "settings.noAddress": "العنوان غير محدد",
  "settings.noPhone": "الهاتف غير محدد",
  "orders.todayRevenue": "إيرادات اليوم",
  "orders.todayOrders": "الطلبات المدفوعة",
  "menu.photo": "صورة",
  "menu.addPhoto": "إضافة صورة",
  "menu.changePhoto": "تغيير",
  "menu.removePhoto": "حذف",
  "client.searchPlaceholder": "ابحث عن طبق...",
  "client.supplements": "الإضافات",
  "client.noResults": "لا توجد نتائج لهذا البحث.",
  "client.orderNow": "اطلب الآن",
  "client.followUs": "تابعونا",
  "settings.description": "الوصف",
  "settings.descriptionPlaceholder": "مثال: مطبخ تونسي أصيل، مفتوح كل أيام الأسبوع…",
  "client.info": "معلومات",
  "client.address": "العنوان",
  "client.reservation": "الحجز",
  "client.wifi": "واي فاي",
  "client.poweredBy": "بدعم من",
  "client.allRightsReserved": "جميع الحقوق محفوظة.",
  "client.soldOut": "غير متوفر",
  "client.addToCart": "أضف إلى السلة",
  "client.itemNote": "ملاحظة لهذا المنتج",
  "client.itemNotePlaceholder": "مثال: بدون بصل... (اختياري)",
  "client.yourInfo": "معلوماتك",
  "client.firstName": "الاسم",
  "client.lastName": "اللقب",
  "client.phone": "الهاتف",
  "client.firstNamePlaceholder": "اسمك",
  "client.lastNamePlaceholder": "لقبك",
  "client.phonePlaceholder": "رقم هاتفك",
  "client.fillRequiredInfo": "يرجى ملء معلوماتك لتأكيد الطلب.",
  "client.missingInfoError": "يرجى إدخال اسمك ولقبك ورقم هاتفك قبل التأكيد.",
  "orders.customer": "الزبون",
  "menu.categoryDescription": "شعار (اختياري)",
  "menu.categoryDescriptionPlaceholder": "مثال: أطباق شهية لكل الأذواق",
  "menu.kcal": "السعرات الحرارية (kcal)",
  "menu.prepMinutes": "وقت التحضير (دقيقة)",
  "menu.badge": "شعار (مثال: مميز، نباتي)",
  "menu.badgePlaceholder": "مثال: مميز",
  "menu.tags": "العلامات (مفصولة بفواصل)",
  "menu.tagsPlaceholder": "مثال: جبن، مكسرات، بدون غلوتين",
  "menu.supplements": "الإضافات",
  "menu.supplementsHint": "احفظ المنتج أولاً، ثم عدّله لإضافة الإضافات.",
  "menu.supplementNamePlaceholder": "مثال: جبن موزاريلا",
  "client.kcal": "سعرة",
  "client.min": "دقيقة",
  "client.soldOut": "غير متوفر",
  "client.addToCart": "أضف إلى السلة",
  "client.itemNote": "ملاحظة لهذا المنتج",
  "client.itemNotePlaceholder": "مثال: بدون بصل... (اختياري)",
  "client.yourInfo": "معلوماتك",
  "client.firstName": "الاسم",
  "client.lastName": "اللقب",
  "client.phone": "الهاتف",
  "client.firstNamePlaceholder": "اسمك",
  "client.lastNamePlaceholder": "لقبك",
  "client.phonePlaceholder": "رقم هاتفك",
  "client.fillRequiredInfo": "يرجى ملء معلوماتك لتأكيد الطلب.",
  "client.missingInfoError": "يرجى إدخال اسمك ولقبك ورقم هاتفك قبل التأكيد.",
  "orders.customer": "الزبون",
  "client.poweredBy": "بدعم من",
  "client.allRightsReserved": "جميع الحقوق محفوظة.",
  "settings.wifi": "كلمة مرور الواي فاي",
  "settings.wifiPlaceholder": "مثال: MyRestaurant2024",
  "settings.banner": "صورة الغلاف",
  "settings.bannerAdjust": "ضبط الموضع",
  "settings.bannerZoom": "تكبير",
  "settings.bannerHint": "اسحب الصورة لإعادة وضعها",
  "settings.logo": "الشعار",
  "settings.facebook": "فيسبوك",
  "settings.instagram": "إنستغرام",
  "settings.facebookPlaceholder": "https://facebook.com/yourpage",
  "settings.instagramPlaceholder": "https://instagram.com/youraccount"
};
const dicts = { fr, ar, en };
const Ctx$1 = reactExports.createContext(null);
function I18nProvider({ children }) {
  const [locale, setLocaleState] = reactExports.useState("fr");
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("menufy.locale");
    if (saved === "fr" || saved === "ar" || saved === "en") setLocaleState(saved);
  }, []);
  reactExports.useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  const setLocale = (l) => {
    setLocaleState(l);
    if (typeof window !== "undefined") localStorage.setItem("menufy.locale", l);
  };
  const t = (key) => dicts[locale][key] ?? key;
  const dir = locale === "ar" ? "rtl" : "ltr";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx$1.Provider, { value: { locale, dir, setLocale, t }, children });
}
function useI18n() {
  const ctx = reactExports.useContext(Ctx$1);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
}
const Ctx = reactExports.createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = reactExports.useState(null);
  const [session, setSession] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx.Provider, { value: { user, session, loading, signOut }, children });
}
function useAuth() {
  const ctx = reactExports.useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-gradient-brand", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold", children: "Page introuvable" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "La page que vous cherchez n'existe pas." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Retour à l'accueil"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight", children: "Une erreur est survenue" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Réessayez ou revenez à l'accueil." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
          children: "Réessayer"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/", className: "inline-flex items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium", children: "Accueil" })
    ] })
  ] }) });
}
const Route$b = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
      { name: "theme-color", content: "#0c0f0a" },
      { title: "Menufy — Votre restaurant digitalisé en 48h" },
      { name: "description", content: "Plateforme QR menu pour restaurants tunisiens. Vos clients scannent, commandent, vous servez. Plus rapide, sans serveur." },
      { property: "og:title", content: "Menufy — QR menu pour restaurants" },
      { property: "og:description", content: "Digitalisez votre restaurant en 48h. Commandes en temps réel, menu bilingue AR/FR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Cairo:wght@400;500;600;700;800&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "fr", className: "dark", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { className: "dark min-h-screen bg-background text-foreground antialiased", children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$b.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(I18nProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center", theme: "dark", richColors: true })
  ] }) }) });
}
const $$splitComponentImporter$a = () => import("./auth-twjmlDam.mjs");
const searchSchema = objectType({
  mode: enumType(["login", "register"]).catch("login").optional()
});
const Route$a = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{
      title: "Connexion — Menufy"
    }, {
      name: "description",
      content: "Connectez-vous ou créez votre compte restaurant Menufy."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./route-BFsOu0JM.mjs");
const Route$9 = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const {
      data,
      error
    } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({
        to: "/auth",
        search: {
          mode: "login"
        }
      });
    }
    return {
      user: data.user
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./index-QDDMd3SY.mjs");
const Route$8 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Menufy — Votre restaurant digitalisé en 48h"
    }, {
      name: "description",
      content: "QR menu, commandes en temps réel, cuisine connectée. La solution menu digital pour les restaurants tunisiens."
    }, {
      property: "og:title",
      content: "Menufy — QR menu pour restaurants tunisiens"
    }, {
      property: "og:description",
      content: "Digitalisez votre restaurant en 48h. Bilingue AR/FR, mobile-first."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./kitchen-DNx6DxTa.mjs");
const Route$7 = createFileRoute("/_authenticated/kitchen")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./dashboard-BFsOu0JM.mjs");
const Route$6 = createFileRoute("/_authenticated/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./cashier-p1yRDZD_.mjs");
const Route$5 = createFileRoute("/_authenticated/cashier")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./dashboard.index-DUMTW4V2.mjs");
const Route$4 = createFileRoute("/_authenticated/dashboard/")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./menu._restaurantId._tableNumber-1eGYeOu3.mjs");
const Route$3 = createFileRoute("/menu/$restaurantId/$tableNumber")({
  head: () => ({
    meta: [{
      title: "Menu — Menufy"
    }, {
      name: "description",
      content: "Commandez directement depuis votre table."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./dashboard.settings-Dthk_Qpd.mjs");
const Route$2 = createFileRoute("/_authenticated/dashboard/settings")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./dashboard.orders-B4759VQz.mjs");
const Route$1 = createFileRoute("/_authenticated/dashboard/orders")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./dashboard.menu-NH029zhz.mjs");
const Route = createFileRoute("/_authenticated/dashboard/menu")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const AuthRoute = Route$a.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$b
});
const AuthenticatedRouteRoute = Route$9.update({
  id: "/_authenticated",
  getParentRoute: () => Route$b
});
const IndexRoute = Route$8.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$b
});
const AuthenticatedKitchenRoute = Route$7.update({
  id: "/kitchen",
  path: "/kitchen",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedDashboardRoute = Route$6.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedCashierRoute = Route$5.update({
  id: "/cashier",
  path: "/cashier",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedDashboardIndexRoute = Route$4.update({
  id: "/",
  path: "/",
  getParentRoute: () => AuthenticatedDashboardRoute
});
const MenuRestaurantIdTableNumberRoute = Route$3.update({
  id: "/menu/$restaurantId/$tableNumber",
  path: "/menu/$restaurantId/$tableNumber",
  getParentRoute: () => Route$b
});
const AuthenticatedDashboardSettingsRoute = Route$2.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AuthenticatedDashboardRoute
});
const AuthenticatedDashboardOrdersRoute = Route$1.update({
  id: "/orders",
  path: "/orders",
  getParentRoute: () => AuthenticatedDashboardRoute
});
const AuthenticatedDashboardMenuRoute = Route.update({
  id: "/menu",
  path: "/menu",
  getParentRoute: () => AuthenticatedDashboardRoute
});
const AuthenticatedDashboardRouteChildren = {
  AuthenticatedDashboardMenuRoute,
  AuthenticatedDashboardOrdersRoute,
  AuthenticatedDashboardSettingsRoute,
  AuthenticatedDashboardIndexRoute
};
const AuthenticatedDashboardRouteWithChildren = AuthenticatedDashboardRoute._addFileChildren(
  AuthenticatedDashboardRouteChildren
);
const AuthenticatedRouteRouteChildren = {
  AuthenticatedCashierRoute,
  AuthenticatedDashboardRoute: AuthenticatedDashboardRouteWithChildren,
  AuthenticatedKitchenRoute
};
const AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  AuthRoute,
  MenuRestaurantIdTableNumberRoute
};
const routeTree = Route$b._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$a as R,
  useAuth as a,
  Route$3 as b,
  router as r,
  useI18n as u
};
