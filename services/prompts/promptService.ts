/**
 * Prompt Service
 * 
 * Handles saving and retrieving user goals/prompts from Supabase
 */

import { supabase } from '../../config/supabase';

export interface Prompt {
  id: string;
  user_id: string;
  prompt_text: string;
  response?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePromptData {
  prompt_text: string;
  response?: string;
}

/**
 * Save a goal/prompt to Supabase
 */
export const savePrompt = async (promptText: string, userId: string): Promise<Prompt | null> => {
  try {
    console.log('💾 Saving prompt to Supabase:', promptText.substring(0, 50) + '...');
    
    const { data, error } = await supabase
      .from('prompts')
      .insert({
        user_id: userId,
        prompt_text: promptText,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error saving prompt:', error);
      throw error;
    }
    
    console.log('✅ Prompt saved successfully:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to save prompt:', error);
    return null;
  }
};

/**
 * Get all prompts for a user
 */
export const getUserPrompts = async (userId: string): Promise<Prompt[]> => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching prompts:', error);
    return [];
  }
};

/**
 * Update a prompt's response (from AI)
 */
export const updatePromptResponse = async (promptId: string, response: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('prompts')
      .update({
        response,
        updated_at: new Date().toISOString(),
      })
      .eq('id', promptId);
    
    if (error) throw error;
    
    console.log('✅ Prompt response updated');
    return true;
  } catch (error) {
    console.error('❌ Error updating prompt response:', error);
    return false;
  }
};

/**
 * Delete a prompt
 */
export const deletePrompt = async (promptId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', promptId);
    
    if (error) throw error;
    
    console.log('✅ Prompt deleted');
    return true;
  } catch (error) {
    console.error('❌ Error deleting prompt:', error);
    return false;
  }
};

export default {
  savePrompt,
  getUserPrompts,
  updatePromptResponse,
  deletePrompt,
};
