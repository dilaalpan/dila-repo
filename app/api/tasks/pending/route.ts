

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';


export async function GET() {
  const { data: pendingTasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_complete', false) 
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Filtreli veri çekme hatası:', error);
    return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 });
  }

  return NextResponse.json(pendingTasks, { status: 200 });
}