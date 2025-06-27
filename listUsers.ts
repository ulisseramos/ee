import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exeykggrfvdlgztkdaem.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZXlrZ2dyZnZkbGd6dGtkYWVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI3MTA2NiwiZXhwIjoyMDY1ODQ3MDY2fQ.BfcAIiRMoWgENwkJsQEEUhhvzwT5CHXwVh8z1ocYhBs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
  try {
    // Primeiro, listamos os usuários através do endpoint de administração
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Erro ao listar usuários via admin:', listError);
      console.log('Tentando alternativa...');
      
      // Se falhar, tentamos listar diretamente da tabela auth.users
      const { data: usersData, error: queryError } = await supabase
        .from('auth.users')
        .select('*');
        
      if (queryError) throw queryError;
      
      console.log('\n=== Usuários do Supabase ===');
      usersData.forEach((user, index) => {
        console.log(`\nUsuário ${index + 1}:`);
        console.log(`ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Criado em: ${user.created_at}`);
        console.log(`Atualizado em: ${user.updated_at}`);
        console.log(`Status: ${user.confirmed_at ? 'Confirmado' : 'Não confirmado'}`);
      });
      return;
    }
    
    console.log('\n=== Usuários do Supabase ===');
    users.forEach((user, index) => {
      console.log(`\nUsuário ${index + 1}:`);
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Criado em: ${user.created_at}`);
      console.log(`Atualizado em: ${user.updated_at}`);
      console.log(`Status: ${user.confirmed_at ? 'Confirmado' : 'Não confirmado'}`);
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
  }
}

listUsers();
