using System.Linq.Expressions;
using System.Reflection;
using PharMind.API.DTOs;

namespace PharMind.API.Services;

/// <summary>
/// Servicio para aplicar filtros dinámicos a consultas LINQ basado en configuración de entidades
/// </summary>
public class EntityFilterService
{
    private readonly ILogger<EntityFilterService> _logger;

    public EntityFilterService(ILogger<EntityFilterService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Aplica filtros dinámicos a una consulta IQueryable
    /// </summary>
    public IQueryable<T> ApplyFilters<T>(
        IQueryable<T> query,
        List<ActiveFilterDto> filters) where T : class
    {
        if (filters == null || !filters.Any())
            return query;

        Expression<Func<T, bool>>? combinedExpression = null;

        foreach (var filter in filters)
        {
            var filterExpression = BuildFilterExpression<T>(filter);

            if (filterExpression == null)
            {
                _logger.LogWarning("No se pudo construir expresión para filtro: {Field}", filter.Field);
                continue;
            }

            if (combinedExpression == null)
            {
                combinedExpression = filterExpression;
            }
            else
            {
                // Combinar con AND u OR según logicalOperator
                if (filter.LogicalOperator?.ToUpper() == "OR")
                {
                    combinedExpression = CombineWithOr(combinedExpression, filterExpression);
                }
                else
                {
                    combinedExpression = CombineWithAnd(combinedExpression, filterExpression);
                }
            }
        }

        return combinedExpression != null ? query.Where(combinedExpression) : query;
    }

    /// <summary>
    /// Construye una expresión de filtro desde un ActiveFilterDto
    /// </summary>
    private Expression<Func<T, bool>>? BuildFilterExpression<T>(ActiveFilterDto filter)
    {
        try
        {
            var parameter = Expression.Parameter(typeof(T), "x");
            Expression? body;

            // Determinar si es campo estático o dinámico
            if (filter.Field.StartsWith("dynamic."))
            {
                // Campo dinámico - acceder a DatosExtendidos.Datos (JSON)
                body = BuildDynamicFieldExpression(parameter, filter);
            }
            else
            {
                // Campo estático - acceso directo a la propiedad
                body = BuildStaticFieldExpression(parameter, filter);
            }

            if (body == null)
                return null;

            return Expression.Lambda<Func<T, bool>>(body, parameter);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error construyendo expresión de filtro para campo: {Field}", filter.Field);
            return null;
        }
    }

    /// <summary>
    /// Construye expresión para campos estáticos
    /// </summary>
    private Expression? BuildStaticFieldExpression(
        ParameterExpression parameter,
        ActiveFilterDto filter)
    {
        var property = GetPropertyExpression(parameter, filter.Field);
        if (property == null)
            return null;

        return filter.Operator switch
        {
            FilterOperator.Eq => BuildEqualExpression(property, filter.Value),
            FilterOperator.Neq => BuildNotEqualExpression(property, filter.Value),
            FilterOperator.Contains => BuildContainsExpression(property, filter.Value),
            FilterOperator.StartsWith => BuildStartsWithExpression(property, filter.Value),
            FilterOperator.EndsWith => BuildEndsWithExpression(property, filter.Value),
            FilterOperator.Gt => BuildGreaterThanExpression(property, filter.Value),
            FilterOperator.Gte => BuildGreaterThanOrEqualExpression(property, filter.Value),
            FilterOperator.Lt => BuildLessThanExpression(property, filter.Value),
            FilterOperator.Lte => BuildLessThanOrEqualExpression(property, filter.Value),
            FilterOperator.Between => BuildBetweenExpression(property, filter.Value, filter.Value2),
            FilterOperator.IsNull => BuildIsNullExpression(property),
            FilterOperator.IsNotNull => BuildIsNotNullExpression(property),
            FilterOperator.In => BuildInExpression(property, filter.Value),
            FilterOperator.NotIn => BuildNotInExpression(property, filter.Value),
            _ => null
        };
    }

    /// <summary>
    /// Construye expresión para campos dinámicos (JSON)
    /// </summary>
    private Expression? BuildDynamicFieldExpression(
        ParameterExpression parameter,
        ActiveFilterDto filter)
    {
        // Extraer nombre del campo dinámico
        var fieldName = filter.Field.Replace("dynamic.", "");

        // Acceder a DatosExtendidos.Datos usando EF.Functions.JsonValue
        // Este es un approach simplificado - puede necesitar ajustes según tu estructura exacta

        // Por ahora retornamos null - esto requiere una implementación más compleja
        // usando JSON queries de SQL Server
        _logger.LogWarning("Filtrado de campos dinámicos no implementado aún para campo: {Field}", fieldName);
        return null;
    }

    /// <summary>
    /// Obtiene la expresión de acceso a una propiedad, soportando propiedades anidadas
    /// </summary>
    private Expression? GetPropertyExpression(Expression parameter, string propertyPath)
    {
        try
        {
            var parts = propertyPath.Split('.');
            Expression current = parameter;

            foreach (var part in parts)
            {
                var property = current.Type.GetProperty(part, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
                if (property == null)
                {
                    _logger.LogWarning("Propiedad no encontrada: {Property} en tipo {Type}", part, current.Type.Name);
                    return null;
                }

                current = Expression.Property(current, property);
            }

            return current;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error accediendo a propiedad: {PropertyPath}", propertyPath);
            return null;
        }
    }

    // Métodos de construcción de expresiones específicas

    private Expression BuildEqualExpression(Expression property, object? value)
    {
        var constant = ConvertToConstant(value, property.Type);
        return Expression.Equal(property, constant);
    }

    private Expression BuildNotEqualExpression(Expression property, object? value)
    {
        var constant = ConvertToConstant(value, property.Type);
        return Expression.NotEqual(property, constant);
    }

    private Expression BuildContainsExpression(Expression property, object? value)
    {
        if (value == null) return Expression.Constant(false);

        var method = typeof(string).GetMethod("Contains", new[] { typeof(string) });
        var constant = Expression.Constant(value.ToString(), typeof(string));
        return Expression.Call(property, method!, constant);
    }

    private Expression BuildStartsWithExpression(Expression property, object? value)
    {
        if (value == null) return Expression.Constant(false);

        var method = typeof(string).GetMethod("StartsWith", new[] { typeof(string) });
        var constant = Expression.Constant(value.ToString(), typeof(string));
        return Expression.Call(property, method!, constant);
    }

    private Expression BuildEndsWithExpression(Expression property, object? value)
    {
        if (value == null) return Expression.Constant(false);

        var method = typeof(string).GetMethod("EndsWith", new[] { typeof(string) });
        var constant = Expression.Constant(value.ToString(), typeof(string));
        return Expression.Call(property, method!, constant);
    }

    private Expression BuildGreaterThanExpression(Expression property, object? value)
    {
        var constant = ConvertToConstant(value, property.Type);
        return Expression.GreaterThan(property, constant);
    }

    private Expression BuildGreaterThanOrEqualExpression(Expression property, object? value)
    {
        var constant = ConvertToConstant(value, property.Type);
        return Expression.GreaterThanOrEqual(property, constant);
    }

    private Expression BuildLessThanExpression(Expression property, object? value)
    {
        var constant = ConvertToConstant(value, property.Type);
        return Expression.LessThan(property, constant);
    }

    private Expression BuildLessThanOrEqualExpression(Expression property, object? value)
    {
        var constant = ConvertToConstant(value, property.Type);
        return Expression.LessThanOrEqual(property, constant);
    }

    private Expression BuildBetweenExpression(Expression property, object? value1, object? value2)
    {
        var constant1 = ConvertToConstant(value1, property.Type);
        var constant2 = ConvertToConstant(value2, property.Type);

        var gte = Expression.GreaterThanOrEqual(property, constant1);
        var lte = Expression.LessThanOrEqual(property, constant2);

        return Expression.AndAlso(gte, lte);
    }

    private Expression BuildIsNullExpression(Expression property)
    {
        return Expression.Equal(property, Expression.Constant(null, property.Type));
    }

    private Expression BuildIsNotNullExpression(Expression property)
    {
        return Expression.NotEqual(property, Expression.Constant(null, property.Type));
    }

    private Expression BuildInExpression(Expression property, object? value)
    {
        if (value == null) return Expression.Constant(false);

        // Convertir value a lista
        var valueList = ConvertToList(value, property.Type);
        if (valueList == null) return Expression.Constant(false);

        var method = typeof(Enumerable).GetMethods()
            .First(m => m.Name == "Contains" && m.GetParameters().Length == 2)
            .MakeGenericMethod(property.Type);

        var constant = Expression.Constant(valueList);
        return Expression.Call(method, constant, property);
    }

    private Expression BuildNotInExpression(Expression property, object? value)
    {
        var inExpression = BuildInExpression(property, value);
        return Expression.Not(inExpression);
    }

    /// <summary>
    /// Convierte un valor a un Expression.Constant del tipo correcto
    /// </summary>
    private Expression ConvertToConstant(object? value, Type targetType)
    {
        if (value == null)
            return Expression.Constant(null, targetType);

        try
        {
            // Manejar tipos nullable
            var underlyingType = Nullable.GetUnderlyingType(targetType) ?? targetType;

            object? convertedValue;

            if (underlyingType == typeof(Guid))
            {
                convertedValue = Guid.Parse(value.ToString()!);
            }
            else if (underlyingType == typeof(DateTime))
            {
                convertedValue = DateTime.Parse(value.ToString()!);
            }
            else if (underlyingType == typeof(bool))
            {
                convertedValue = Convert.ToBoolean(value);
            }
            else if (underlyingType.IsEnum)
            {
                convertedValue = Enum.Parse(underlyingType, value.ToString()!);
            }
            else
            {
                convertedValue = Convert.ChangeType(value, underlyingType);
            }

            return Expression.Constant(convertedValue, targetType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error convirtiendo valor {Value} a tipo {Type}", value, targetType);
            return Expression.Constant(null, targetType);
        }
    }

    /// <summary>
    /// Convierte un valor a una lista del tipo correcto
    /// </summary>
    private object? ConvertToList(object value, Type elementType)
    {
        try
        {
            if (value is System.Text.Json.JsonElement jsonElement && jsonElement.ValueKind == System.Text.Json.JsonValueKind.Array)
            {
                var listType = typeof(List<>).MakeGenericType(elementType);
                var list = Activator.CreateInstance(listType);
                var addMethod = listType.GetMethod("Add");

                foreach (var item in jsonElement.EnumerateArray())
                {
                    var convertedItem = ConvertJsonElement(item, elementType);
                    addMethod!.Invoke(list, new[] { convertedItem });
                }

                return list;
            }

            return value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error convirtiendo valor a lista");
            return null;
        }
    }

    /// <summary>
    /// Convierte un JsonElement al tipo correcto
    /// </summary>
    private object? ConvertJsonElement(System.Text.Json.JsonElement element, Type targetType)
    {
        var underlyingType = Nullable.GetUnderlyingType(targetType) ?? targetType;

        return element.ValueKind switch
        {
            System.Text.Json.JsonValueKind.String => underlyingType == typeof(Guid)
                ? Guid.Parse(element.GetString()!)
                : element.GetString(),
            System.Text.Json.JsonValueKind.Number => underlyingType == typeof(int)
                ? element.GetInt32()
                : underlyingType == typeof(decimal)
                ? element.GetDecimal()
                : element.GetDouble(),
            System.Text.Json.JsonValueKind.True => true,
            System.Text.Json.JsonValueKind.False => false,
            _ => null
        };
    }

    /// <summary>
    /// Combina dos expresiones con AND
    /// </summary>
    private Expression<Func<T, bool>> CombineWithAnd<T>(
        Expression<Func<T, bool>> left,
        Expression<Func<T, bool>> right)
    {
        var parameter = Expression.Parameter(typeof(T), "x");
        var leftBody = ReplaceParameter(left.Body, left.Parameters[0], parameter);
        var rightBody = ReplaceParameter(right.Body, right.Parameters[0], parameter);
        var combined = Expression.AndAlso(leftBody, rightBody);
        return Expression.Lambda<Func<T, bool>>(combined, parameter);
    }

    /// <summary>
    /// Combina dos expresiones con OR
    /// </summary>
    private Expression<Func<T, bool>> CombineWithOr<T>(
        Expression<Func<T, bool>> left,
        Expression<Func<T, bool>> right)
    {
        var parameter = Expression.Parameter(typeof(T), "x");
        var leftBody = ReplaceParameter(left.Body, left.Parameters[0], parameter);
        var rightBody = ReplaceParameter(right.Body, right.Parameters[0], parameter);
        var combined = Expression.OrElse(leftBody, rightBody);
        return Expression.Lambda<Func<T, bool>>(combined, parameter);
    }

    /// <summary>
    /// Reemplaza un parámetro en una expresión
    /// </summary>
    private Expression ReplaceParameter(Expression expression, ParameterExpression oldParameter, ParameterExpression newParameter)
    {
        return new ParameterReplacer(oldParameter, newParameter).Visit(expression)!;
    }

    /// <summary>
    /// Visitor para reemplazar parámetros en expresiones
    /// </summary>
    private class ParameterReplacer : ExpressionVisitor
    {
        private readonly ParameterExpression _oldParameter;
        private readonly ParameterExpression _newParameter;

        public ParameterReplacer(ParameterExpression oldParameter, ParameterExpression newParameter)
        {
            _oldParameter = oldParameter;
            _newParameter = newParameter;
        }

        protected override Expression VisitParameter(ParameterExpression node)
        {
            return node == _oldParameter ? _newParameter : base.VisitParameter(node);
        }
    }
}
