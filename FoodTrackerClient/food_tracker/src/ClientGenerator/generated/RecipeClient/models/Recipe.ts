/* tslint:disable */
/* eslint-disable */
/**
 * Recipes API
 * API za upravljanje s podatki o receptih.
 *
 * The version of the OpenAPI document: v1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { Nutrition } from './Nutrition';
import {
    NutritionFromJSON,
    NutritionFromJSONTyped,
    NutritionToJSON,
    NutritionToJSONTyped,
} from './Nutrition';
import type { Ingredient } from './Ingredient';
import {
    IngredientFromJSON,
    IngredientFromJSONTyped,
    IngredientToJSON,
    IngredientToJSONTyped,
} from './Ingredient';

/**
 * 
 * @export
 * @interface Recipe
 */
export interface Recipe {
    /**
     * 
     * @type {string}
     * @memberof Recipe
     */
    id?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Recipe
     */
    name?: string | null;
    /**
     * 
     * @type {Array<Ingredient>}
     * @memberof Recipe
     */
    ingredients?: Array<Ingredient> | null;
    /**
     * 
     * @type {Nutrition}
     * @memberof Recipe
     */
    totalNutrition?: Nutrition;
    /**
     * 
     * @type {number}
     * @memberof Recipe
     */
    servings?: number;
    /**
     * 
     * @type {string}
     * @memberof Recipe
     */
    instructions?: string | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof Recipe
     */
    tags?: Array<string> | null;
}

/**
 * Check if a given object implements the Recipe interface.
 */
export function instanceOfRecipe(value: object): value is Recipe {
    return true;
}

export function RecipeFromJSON(json: any): Recipe {
    return RecipeFromJSONTyped(json, false);
}

export function RecipeFromJSONTyped(json: any, ignoreDiscriminator: boolean): Recipe {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['Id'] == null ? undefined : json['Id'],
        'name': json['Name'] == null ? undefined : json['Name'],
        'ingredients': json['Ingredients'] == null ? undefined : ((json['Ingredients'] as Array<any>).map(IngredientFromJSON)),
        'totalNutrition': json['TotalNutrition'] == null ? undefined : NutritionFromJSON(json['TotalNutrition']),
        'servings': json['Servings'] == null ? undefined : json['Servings'],
        'instructions': json['Instructions'] == null ? undefined : json['Instructions'],
        'tags': json['Tags'] == null ? undefined : json['Tags'],
    };
}

export function RecipeToJSON(json: any): Recipe {
    return RecipeToJSONTyped(json, false);
}

export function RecipeToJSONTyped(value?: Recipe | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'Id': value['id'],
        'Name': value['name'],
        'Ingredients': value['ingredients'] == null ? undefined : ((value['ingredients'] as Array<any>).map(IngredientToJSON)),
        'TotalNutrition': NutritionToJSON(value['totalNutrition']),
        'Servings': value['servings'],
        'Instructions': value['instructions'],
        'Tags': value['tags'],
    };
}

