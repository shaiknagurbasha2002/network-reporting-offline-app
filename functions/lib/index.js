"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onLegacyReportDeleted = exports.onLegacyReportCreated = exports.onNetworkReportDeleted = exports.onNetworkReportCreated = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
async function updateUserFromReport(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const uid = data.userId;
    if (!uid)
        return;
    await db.doc(`users/${uid}`).set({
        uid,
        displayName: (_b = (_a = data.userName) !== null && _a !== void 0 ? _a : data.name) !== null && _b !== void 0 ? _b : "User",
        name: (_d = (_c = data.userName) !== null && _c !== void 0 ? _c : data.name) !== null && _d !== void 0 ? _d : "User",
        email: (_f = (_e = data.userEmail) !== null && _e !== void 0 ? _e : data.email) !== null && _f !== void 0 ? _f : "",
        photoURL: (_h = (_g = data.userPhotoURL) !== null && _g !== void 0 ? _g : data.photoURL) !== null && _h !== void 0 ? _h : null,
        reportsCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });
}
async function ensureReportFields(ref, data) {
    const updates = {};
    if (!data.createdAt) {
        updates.createdAt = FieldValue.serverTimestamp();
    }
    if (!data.userEmail && data.email) {
        updates.userEmail = data.email;
    }
    if (!data.userName && data.name) {
        updates.userName = data.name;
    }
    if (Object.keys(updates).length > 0) {
        await ref.set(updates, { merge: true });
    }
}
exports.onNetworkReportCreated = functions.firestore
    .document("network_reports/{reportId}")
    .onCreate(async (snap) => {
    const data = snap.data() || {};
    await ensureReportFields(snap.ref, data);
    await updateUserFromReport(data);
});
exports.onNetworkReportDeleted = functions.firestore
    .document("network_reports/{reportId}")
    .onDelete(async (snap) => {
    const data = snap.data() || {};
    const uid = data.userId;
    if (!uid)
        return;
    await db.doc(`users/${uid}`).set({
        reportsCount: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
});
exports.onLegacyReportCreated = functions.firestore
    .document("reports/{reportId}")
    .onCreate(async (snap) => {
    const data = snap.data() || {};
    await ensureReportFields(snap.ref, data);
    await updateUserFromReport(data);
});
exports.onLegacyReportDeleted = functions.firestore
    .document("reports/{reportId}")
    .onDelete(async (snap) => {
    const data = snap.data() || {};
    const uid = data.userId;
    if (!uid)
        return;
    await db.doc(`users/${uid}`).set({
        reportsCount: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
});
//# sourceMappingURL=index.js.map