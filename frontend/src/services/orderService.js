// 8. Mettre à jour les stats du livreur après livraison
export async function updateDeliveryStats(deliveryPersonId, earnings = 0) {
    // Récupérer les stats actuelles
    const { data: current, error: fetchError } = await supabase
        .from('delivery_persons')
        .select('total_deliveries, total_earnings')
        .eq('user_id', deliveryPersonId)
        .single();
    if (fetchError) return { data: null, error: fetchError };

    const newTotalDeliveries = (current?.total_deliveries || 0) + 1;
    const newTotalEarnings = (current?.total_earnings || 0) + earnings;

    const { data, error } = await supabase
        .from('delivery_persons')
        .update({
            total_deliveries: newTotalDeliveries,
            total_earnings: newTotalEarnings
        })
        .eq('user_id', deliveryPersonId)
        .select()
        .single();
    return { data, error };
}
// 7. Voir les missions livrées du coursier (avec adresses complètes)
export async function getDeliveredMissions(deliveryPersonId) {
    const { data, error } = await supabase
        .from('delivery_missions')
        .select(`*, orders(*, shop:shop_id(*))`)
        .eq('delivery_person_id', deliveryPersonId)
        .eq('status', 'delivered')
        .order('updated_at', { ascending: false });
    return { data, error };
}
// Service pour gérer les commandes et missions coursier avec Supabase
import { supabase } from '../lib/supabaseClient';

// 1. Créer une commande (client)
export async function createOrder({ userId, customerName, customerEmail, totalAmount, shopId }) {
    const { data, error } = await supabase
        .from('orders')
        .insert([
            {
                user_id: userId,
                customer_name: customerName,
                customer_email: customerEmail,
                total_amount: totalAmount,
                shop_id: shopId,
                status: 'en_attente'
            }
        ])
        .select()
        .single();
    return { data, error };
}

// 2. Passer une commande à "prête pour livraison" (boutique/admin)
export async function setOrderReady(orderId) {
    const { data, error } = await supabase
        .from('orders')
        .update({ status: 'pret_pour_livraison' })
        .eq('id', orderId)
        .select()
        .single();
    return { data, error };
}

// 3. Récupérer les commandes prêtes pour les coursiers
export async function getReadyOrders() {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pret_pour_livraison');
    return { data, error };
}

// 4. Le coursier accepte une commande (crée une mission)
export async function acceptOrder(orderId, deliveryPersonId) {
    const { data, error } = await supabase
        .from('delivery_missions')
        .insert([
            {
                order_id: orderId,
                delivery_person_id: deliveryPersonId,
                status: 'accepted'
            }
        ])
        .select()
        .single();
    return { data, error };
}

// 5. Le coursier marque la mission comme livrée
export async function setMissionDelivered(missionId) {
    const { data, error } = await supabase
        .from('delivery_missions')
        .update({ status: 'delivered' })
        .eq('id', missionId)
        .select()
        .single();
    return { data, error };
}

// 6. Voir les missions du coursier (avec adresses complètes)
export async function getMyMissions(deliveryPersonId) {
    const { data, error } = await supabase
        .from('delivery_missions')
        .select(`*, orders(*, shop:shop_id(*))`)
        .eq('delivery_person_id', deliveryPersonId)
        .order('created_at', { ascending: false });
    return { data, error };
}
