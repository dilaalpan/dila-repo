import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; 


export async function GET() {
 
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false }); 
  if (error) {
    console.error('Veri çekme hatası:', error);
  
    return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 });
  }

  
  return NextResponse.json(tasks, { status: 200 });
}

export async function POST(request: Request) {
  const { title } = await request.json();

  if (!title) {
    
    return new Response(JSON.stringify({ error: 'Başlık alanı zorunludur' }), { status: 400 });
  }

  const { data: newTask, error } = await supabase
    .from('tasks')
    .insert([{ title, is_complete: false }])
    .select()
    .single();

  if (error) {
    console.error('Görev ekleme hatası:', error);
    
    return new Response(JSON.stringify({ error: 'Veritabanı hatası' }), { status: 500 });
  }

  
  return new Response(JSON.stringify(newTask), { status: 201 });
}



export async function PUT(request: Request) {
  
  const { id, is_complete } = await request.json();

  if (!id || typeof is_complete === 'undefined') {
    return new Response(JSON.stringify({ error: 'ID ve durum bilgisi zorunludur' }), { status: 400 });
  }

  const { data: updatedTask, error } = await supabase
    .from('tasks')
    .update({ is_complete }) 
    .eq('id', id) 
    .select()
    .single();

  if (error) {
    console.error('Görev güncelleme hatası:', error);
    return new Response(JSON.stringify({ error: 'Veritabanı hatası' }), { status: 500 });
  }

  
  return new Response(JSON.stringify(updatedTask), { status: 200 });
}



export async function DELETE(request: Request) {
  
  const { id } = await request.json();

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 });
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id); 

  if (error) {
    console.error('Task deletion mistake:', error);
    return new Response(JSON.stringify({ error: 'Database mistake' }), { status: 500 });
  }

  
  return new Response(JSON.stringify({ message: 'Task deleted succesfuly' }), { status: 200 });
}