import {
  collection,
  CollectionReference,
  Firestore,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { UpdateDoc } from "../../src";

export async function getLastUpdate(db: Firestore): Promise<UpdateDoc | null> {
  const updatesCollRef = collection(
    db,
    "updates"
  ) as CollectionReference<UpdateDoc>;
  const q = query(updatesCollRef, orderBy("created_at", "desc"), limit(1));

  const snapshot = await getDocs(q);
  if (snapshot.docs.length == 0) return null;

  return snapshot.docs[0].data();
}
